// Spotify Web API: exchanges the long-lived refresh token for a short-lived
// access token, then reads what is playing now plus the top tracks, albums
// and artists from the last ~4 weeks. Secrets stay on the server; the browser
// only ever sees the shaped JSON below.

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'
const TIME_RANGE = 'short_term' // ~last 4 weeks
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

// Access tokens last an hour; reuse one until shortly before it expires.
// Parallel callers share a single in-flight refresh.
let token = null
let tokenRequest = null

function getAccessToken() {
  if (token && Date.now() < token.expiresAt) {
    return token.value
  }

  tokenRequest ??= refreshAccessToken().finally(() => {
    tokenRequest = null
  })
  return tokenRequest
}

async function refreshAccessToken() {
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
  token = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  }
  return token.value
}

async function spotifyGet(endpoint) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`${endpoint} failed (${response.status})`)
  }

  // currently-playing answers 204 with no body when nothing is playing.
  return response.status === 204 ? null : response.json()
}

const joinNames = (artists = []) => artists.map((a) => a.name).join(', ')

// Covers come widest-first (640, 300, 64); 300px stays sharp as a thumbnail.
const coverUrl = (images = []) => (images[1] ?? images[0])?.url

function shapeTrack(track) {
  return {
    title: track.name,
    artist: joinNames(track.artists),
    url: track.external_urls?.spotify,
    image: coverUrl(track.album?.images),
  }
}

export async function getNowPlaying() {
  const current = await spotifyGet('/me/player/currently-playing')

  if (current?.item && current.currently_playing_type === 'track') {
    return { isPlaying: current.is_playing, ...shapeTrack(current.item) }
  }

  // Nothing playing (or a podcast): show the last track instead.
  const recent = await spotifyGet('/me/player/recently-played?limit=1')
  const last = recent?.items?.[0]
  return last ? { isPlaying: false, ...shapeTrack(last.track) } : null
}

// Spotify has no top-albums endpoint, so rank albums by how many of the top
// 50 tracks they hold. The sort is stable, so ties go to the album whose best
// track ranks higher.
function rankAlbums(tracks) {
  const counts = new Map()
  for (const { album } of tracks) {
    if (!album?.id) continue
    const entry = counts.get(album.id) ?? {
      count: 0,
      album: { title: album.name, artist: joinNames(album.artists), url: album.external_urls?.spotify },
    }
    entry.count += 1
    counts.set(album.id, entry)
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, LIMIT)
    .map((entry) => entry.album)
}

export async function getSpotifyStats() {
  const [me, tracks, artists] = await Promise.all([
    spotifyGet('/me'),
    spotifyGet(`/me/top/tracks?time_range=${TIME_RANGE}&limit=50`),
    spotifyGet(`/me/top/artists?time_range=${TIME_RANGE}&limit=${LIMIT}`),
  ])
  const topTracks = tracks?.items || []

  return {
    profileUrl: me?.external_urls?.spotify,
    topTracks: topTracks.slice(0, LIMIT).map((track) => ({
      title: track.name,
      artist: joinNames(track.artists),
      url: track.external_urls?.spotify,
    })),
    topAlbums: rankAlbums(topTracks),
    topArtists: (artists?.items || []).map((artist) => ({
      name: artist.name,
      url: artist.external_urls?.spotify,
    })),
    updatedAt: new Date().toISOString(),
  }
}
