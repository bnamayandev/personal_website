import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getNowPlaying, getSpotifyStats } from './spotify.js'
import { getSteamStats } from './steam.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const port = Number(process.env.PORT) || 3001
// Loopback only by default: on the Pi the tunnel/reverse proxy is the only
// thing that should reach this port. Set HOST=0.0.0.0 to expose it on the LAN.
const host = process.env.HOST || '127.0.0.1'
const isProduction = process.env.NODE_ENV === 'production'

const app = express()
app.disable('x-powered-by')

// The page only loads its own files plus Google Fonts, Spotify album art, and
// Pyodide (the easter egg's Python runtime) from jsDelivr, which also needs to
// compile WebAssembly. Inline styles stay allowed for React style props.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: https://i.scdn.co",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

app.use((_req, res, next) => {
  res.set({
    'Content-Security-Policy': CONTENT_SECURITY_POLICY,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  })
  next()
})

// Small in-memory cache so we are not hammering Spotify/Steam on every page view.
const CACHE_TTL_MS = Number(process.env.STATS_CACHE_MINUTES || 10) * 60 * 1000
// Now playing goes stale fast, so it gets a much shorter cache.
const NOW_PLAYING_TTL_MS = 20 * 1000
// Failures are remembered briefly too, so an outage (or someone hammering the
// endpoint) cannot turn every request into a fresh upstream call.
const ERROR_TTL_MS = 30 * 1000
const cache = new Map()

// Caches the loader's promise, so concurrent requests share one upstream call.
function cached(key, loader, ttl = CACHE_TTL_MS) {
  const hit = cache.get(key)
  if (hit && Date.now() < hit.expiresAt) {
    return hit.promise
  }

  const entry = { promise: loader(), expiresAt: Infinity }
  cache.set(key, entry)
  entry.promise.then(
    () => {
      entry.expiresAt = Date.now() + ttl
    },
    () => {
      entry.expiresAt = Date.now() + ERROR_TTL_MS
    },
  )
  return entry.promise
}

// Allow the Vite dev server (different origin) to call the API directly. In
// production the site and API share an origin, so no CORS header is needed.
if (!isProduction) {
  app.use('/api', (_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*')
    next()
  })
}

app.get('/api/spotify', async (_req, res) => {
  // A now-playing hiccup should not take the weekly stats down with it.
  const nowPlaying = cached('spotify:now', getNowPlaying, NOW_PLAYING_TTL_MS).catch((error) => {
    console.error('[spotify:now]', error.message)
    return null
  })

  try {
    const stats = await cached('spotify', getSpotifyStats)
    res.json({ nowPlaying: await nowPlaying, ...stats })
  } catch (error) {
    console.error('[spotify]', error.message)
    res.status(502).json({ error: 'spotify_unavailable' })
  }
})

app.get('/api/steam', async (_req, res) => {
  try {
    const data = await cached('steam', getSteamStats)
    res.json(data)
  } catch (error) {
    console.error('[steam]', error.message)
    res.status(502).json({ error: 'steam_unavailable' })
  }
})

// Serve the built SPA (production on the Pi). In dev, Vite serves the app and
// proxies /api here, so this static block is simply skipped.
app.use(express.static(distDir))
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) next()
  })
})

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`)
})
