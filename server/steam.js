// Steam Web API: recently played games for a single SteamID64. The API key is
// secret and Steam does not allow browser CORS, so this must run server side.

const API_URL = 'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/'
const LIMIT = Number(process.env.STEAM_LIMIT || 4)

function requireEnv() {
  const key = process.env.STEAM_API_KEY
  const steamId = process.env.STEAM_ID

  if (!key || !steamId) {
    throw new Error('Missing STEAM_API_KEY / STEAM_ID')
  }

  return { key, steamId }
}

function describePlaytime(minutesTwoWeeks) {
  const hours = Math.round((minutesTwoWeeks || 0) / 60)

  if (hours <= 0) {
    return 'a quick session lately'
  }

  if (hours === 1) {
    return '1 hr in the last two weeks'
  }

  return `${hours} hrs in the last two weeks`
}

export async function getSteamStats() {
  const { key, steamId } = requireEnv()
  const url = `${API_URL}?key=${key}&steamid=${steamId}&count=${LIMIT}&format=json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`recently played failed (${response.status})`)
  }

  const json = await response.json()
  const games = json.response?.games || []

  return {
    recentGames: games.map((game) => ({
      name: game.name,
      detail: describePlaytime(game.playtime_2weeks),
    })),
    updatedAt: new Date().toISOString(),
  }
}
