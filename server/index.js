import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getSpotifyStats } from './spotify.js'
import { getSteamStats } from './steam.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const port = Number(process.env.PORT) || 3001

const app = express()

// Small in-memory cache so we are not hammering Spotify/Steam on every page view.
const CACHE_TTL_MS = Number(process.env.STATS_CACHE_MINUTES || 10) * 60 * 1000
const cache = new Map()

async function cached(key, loader) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value
  }

  const value = await loader()
  cache.set(key, { at: Date.now(), value })
  return value
}

// Allow the Vite dev server (different origin) to call the API directly.
app.use('/api', (_req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/api/spotify', async (_req, res) => {
  try {
    const data = await cached('spotify', getSpotifyStats)
    res.json(data)
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
  if (req.method !== 'GET') {
    next()
    return
  }
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) next()
  })
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
