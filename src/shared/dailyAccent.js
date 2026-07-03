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
    hue,
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

function drawDailyFaviconDataUrl(hue) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const accent = `hsl(${hue.toFixed(1)} ${ACCENT_SAT}% ${ACCENT_LIGHT}%)`

  const r = 12
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.arcTo(size, 0, size, size, r)
  ctx.arcTo(size, size, 0, size, r)
  ctx.arcTo(0, size, 0, 0, r)
  ctx.arcTo(0, 0, size, 0, r)
  ctx.closePath()
  ctx.fillStyle = '#2b2c31'
  ctx.fill()

  ctx.fillStyle = accent
  ctx.font = '700 42px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ß', size / 2, size / 2 + 3)

  return canvas.toDataURL('image/png')
}

export function applyDailyFavicon(date = new Date()) {
  if (typeof document === 'undefined') return
  const { hue } = getDailyAccent(date)
  const href = drawDailyFaviconDataUrl(hue)
  if (!href) return

  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/png'
  link.href = href
}
