// Picks a vibrant accent color that changes once per local day and applies it
// to the --accent / --accent-hover CSS tokens. Everything else derives from
// --accent, so the whole site re-themes from this single pair.

const GOLDEN_ANGLE = 137.508 // spreads consecutive days across the hue wheel
const ACCENT_SAT = 74
const ACCENT_LIGHT = 63

function hslToHex(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const channel = (n) => {
    const k = (n + h / 30) % 12
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase()
}

export function getDailyAccent(date = new Date()) {
  const localMs = date.getTime() - date.getTimezoneOffset() * 60000
  const dayIndex = Math.floor(localMs / 86400000)
  const hue = ((dayIndex * GOLDEN_ANGLE) % 360 + 360) % 360

  return {
    accent: `hsl(${hue.toFixed(1)} ${ACCENT_SAT}% ${ACCENT_LIGHT}%)`,
    accentHover: `hsl(${hue.toFixed(1)} 78% 74%)`,
    hex: hslToHex(hue, ACCENT_SAT, ACCENT_LIGHT),
  }
}

export function applyDailyAccent(date = new Date()) {
  const { accent, accentHover } = getDailyAccent(date)
  const root = document.documentElement
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-hover', accentHover)
}
