// One-time helper to obtain a Spotify refresh token.
//
//   1. Create an app at https://developer.spotify.com/dashboard
//   2. In the app settings add this exact Redirect URI:
//        http://127.0.0.1:8888/callback
//   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
//   4. Run:  node server/get-spotify-token.js
//   5. Open the printed URL, approve, and copy the refresh token it prints
//      into .env as SPOTIFY_REFRESH_TOKEN
//
// You only need to do this once.

import 'dotenv/config'
import express from 'express'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback'
const scope = 'user-top-read'
const port = Number(new URL(redirectUri).port) || 8888

if (!clientId || !clientSecret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first.')
  process.exit(1)
}

const app = express()

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

  console.log('\n=== Add this to your .env ===')
  console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}\n`)
  res.send('Refresh token printed in your terminal. You can close this tab.')
  setTimeout(() => process.exit(0), 500)
})

app.listen(port, () => {
  console.log(`Open http://127.0.0.1:${port}/login to authorize Spotify.`)
})
