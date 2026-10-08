// One-time helper to obtain a Spotify refresh token.
//
//   1. Create an app at https://developer.spotify.com/dashboard
//   2. In the app settings add this exact Redirect URI:
//        http://127.0.0.1:8888/callback
//   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
//   4. Run:  node server/get-spotify-token.js   (on the machine with your browser)
//   5. Open the printed URL and approve. The refresh token is saved straight
//      into .env as SPOTIFY_REFRESH_TOKEN.
//
// You only need to do this once (or again if the scopes below ever change).

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import express from 'express'

// Resolve .env from the project root so this works from any directory.
const envPath = fileURLToPath(new URL('../.env', import.meta.url))
dotenv.config({ path: envPath, quiet: true })

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback'
// Top items for the 4-week stats, currently-playing for the live track, and
// recently-played for the last track when nothing is playing.
const scope = 'user-top-read user-read-recently-played user-read-currently-playing'
const { hostname, port } = new URL(redirectUri)

if (!clientId || !clientSecret) {
  console.error(`Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in ${envPath} first.`)
  process.exit(1)
}

function saveRefreshToken(refreshToken) {
  const line = `SPOTIFY_REFRESH_TOKEN=${refreshToken}`
  const env = fs.readFileSync(envPath, 'utf8')
  const updated = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${env.trimEnd()}\n${line}\n`
  fs.writeFileSync(envPath, updated)
}

const app = express()

app.use((req, _res, next) => {
  console.log(`  <- browser hit ${req.path}`)
  next()
})

app.get('/login', (_req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  })
  res.redirect(`https://accounts.spotify.com/authorize?${params}`)
})

app.get('/callback', async (req, res) => {
  // Spotify sends ?error=... instead of a code if you click Cancel.
  if (req.query.error) {
    console.error(`Spotify returned an error: ${req.query.error}`)
    res.status(400).send(`Spotify returned "${req.query.error}". Try /login again.`)
    return
  }

  const code = req.query.code
  if (!code) {
    res.status(400).send('Missing code')
    return
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  const json = await response.json()

  if (!response.ok) {
    console.error('Token exchange failed:', json)
    res.status(500).send('Token exchange failed, see terminal.')
    return
  }

  saveRefreshToken(json.refresh_token)
  console.log(`\nSaved SPOTIFY_REFRESH_TOKEN to ${envPath}`)
  res.send('Done! Your refresh token was saved to .env. You can close this tab.')
  setTimeout(() => process.exit(0), 500)
})

const server = app.listen(Number(port) || 8888, hostname, () => {
  console.log(`Open http://${hostname}:${port}/login to authorize Spotify.`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use (another copy of this script, or Jupyter?). Stop it and retry.`)
  } else {
    console.error(error.message)
  }
  process.exit(1)
})
