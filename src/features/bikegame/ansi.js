const TERM_BG = '#211f1d'

const FG = {
  31: '#e34d76',
  32: '#a7c080',
  34: '#8fb0c4',
}

const BG = {
  41: '#e34d76',
  42: '#a7c080',
  43: '#d9a441',
}

const ESC = String.fromCharCode(27)
const SGR = new RegExp(`${ESC}\\[(\\d+)m`, 'g')

export function ansiToSegments(text) {
  const segments = []
  let fg = null
  let bg = null
  let last = 0
  let match

  const push = (str) => {
    if (!str) return
    const style = {}
    if (bg) {
      style.background = BG[bg]
      style.color = TERM_BG
    } else if (fg) {
      style.color = FG[fg]
    }
    segments.push({ text: str, style })
  }

  SGR.lastIndex = 0
  while ((match = SGR.exec(text)) !== null) {
    push(text.slice(last, match.index))
    const code = Number(match[1])
    if (code === 0) {
      fg = null
      bg = null
    } else if (code === 39) {
      fg = null
    } else if (code === 49) {
      bg = null
    } else if (code >= 30 && code <= 37) {
      fg = code
    } else if (code >= 40 && code <= 47) {
      bg = code
    }
    last = SGR.lastIndex
  }
  push(text.slice(last))
  return segments
}
