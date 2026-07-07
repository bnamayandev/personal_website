// Spotify Web API: exchanges the long-lived refresh token for a short-lived
// access token, then reads the user's top artists and tracks. Secrets stay on
// the server; the browser only ever sees the shaped JSON below.

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'
const TIME_RANGE = process.env.SPOTIFY_TIME_RANGE || 'short_term' // ~last 4 weeks
const LIMIT = Number(process.env.SPOTIFY_LIMIT || 4)

function requireEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN')
  }

  return { clientId, clientSecret, refreshToken }
}

async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = requireEnv()
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error(`token request failed (${response.status})`)
  }

  const json = await response.json()
  return json.access_token
}

async function getTop(accessToken, type) {
  const url = `${API_BASE}/me/top/${type}?time_range=${TIME_RANGE}&limit=${LIMIT}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`top ${type} failed (${response.status})`)
  }

  const json = await response.json()
  return json.items || []
}

export async function getSpotifyStats() {
  const accessToken = await getAccessToken()
  const [artists, tracks] = await Promise.all([
    getTop(accessToken, 'artists'),
    getTop(accessToken, 'tracks'),
  ])

  return {
    topArtists: artists.map((artist) => artist.name),
    topTracks: tracks.map((track) => ({
      title: track.name,
      artist: (track.artists || []).map((a) => a.name).join(', '),
    })),
    updatedAt: new Date().toISOString(),
  }
}
