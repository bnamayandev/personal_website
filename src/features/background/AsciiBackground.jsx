import { useEffect, useRef } from 'react'

import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// Calm base field -> denser glyphs as the ripple intensifies.
const RAMP = ['·', '+', '*', 'o', 'O', '0', '#']
const BASE_CHAR = RAMP[0]

const FONT_SIZE = 13
const LINE_HEIGHT = 17
const INFLUENCE = 175 // px radius of the cursor's distortion
const DISPLACE = 1.35 // how far cells are pushed out, in cell-widths

function hexToRgb(hex) {
  const value = hex.trim().replace('#', '')
  const full = value.length === 3 ? value.replace(/(.)/g, '$1$1') : value
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function smoothstep(edge) {
  const t = Math.min(Math.max(edge, 0), 1)
  return t * t * (3 - 2 * t)
}

function AsciiBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const styles = getComputedStyle(document.documentElement)
    const mutedRgb = hexToRgb(styles.getPropertyValue('--muted-soft') || '#6f6a5e')
    const accentRgb = hexToRgb(styles.getPropertyValue('--accent') || '#e34d76')
    const fontStack = `${FONT_SIZE}px ${styles.getPropertyValue('--mono') || 'monospace'}`

    const pointer = { x: -9999, y: -9999, strength: 0, target: 0 }
    let cols = 0
    let rows = 0
    let charW = 0
    let lines = [] // per-row strings, laid out by pretext
    let frameId = 0
    let running = false

    const setFont = () => {
      ctx.font = fontStack
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
    }

    const drawBaseCell = (col, row) => {
      ctx.fillStyle = `rgba(${mutedRgb[0]}, ${mutedRgb[1]}, ${mutedRgb[2]}, 0.13)`
      ctx.fillText(BASE_CHAR, col * charW + charW / 2, row * LINE_HEIGHT + LINE_HEIGHT / 2)
    }

    const drawStaticField = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      setFont()
      for (let row = 0; row < lines.length; row += 1) {
        const text = lines[row]
        for (let col = 0; col < text.length; col += 1) {
          if (text[col] !== ' ') drawBaseCell(col, row)
        }
      }
    }

    const build = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setFont()

      charW = ctx.measureText('M').width || FONT_SIZE * 0.6
      cols = Math.ceil(w / charW) + 1
      rows = Math.ceil(h / LINE_HEIGHT) + 1

      // Let pretext lay the character stream out into rows (no DOM reflow).
      const source = Array.from({ length: rows }, () => BASE_CHAR.repeat(cols)).join('\n')
      const prepared = prepareWithSegments(source, fontStack, { whiteSpace: 'pre-wrap' })
      const result = layoutWithLines(prepared, w, LINE_HEIGHT)
      lines = result.lines.map((line) => line.text)

      drawStaticField()
    }

    const renderFrame = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      pointer.strength += (pointer.target - pointer.strength) * 0.08

      ctx.clearRect(0, 0, w, h)
      setFont()

      // Redraw only the cells near the cursor; the rest stays the calm base field.
      const reach = INFLUENCE * 1.3
      const minCol = Math.max(0, Math.floor((pointer.x - reach) / charW))
      const maxCol = Math.ceil((pointer.x + reach) / charW)
      const minRow = Math.max(0, Math.floor((pointer.y - reach) / LINE_HEIGHT))
      const maxRow = Math.ceil((pointer.y + reach) / LINE_HEIGHT)

      for (let row = 0; row < lines.length; row += 1) {
        const text = lines[row]
        const inRippleRow = row >= minRow && row <= maxRow && pointer.strength > 0.001
        for (let col = 0; col < text.length; col += 1) {
          if (text[col] === ' ') continue

          if (!inRippleRow || col < minCol || col > maxCol) {
            drawBaseCell(col, row)
            continue
          }

          const cx = col * charW + charW / 2
          const cy = row * LINE_HEIGHT + LINE_HEIGHT / 2
          const dx = cx - pointer.x
          const dy = cy - pointer.y
          const dist = Math.hypot(dx, dy)

          if (dist > INFLUENCE) {
            drawBaseCell(col, row)
            continue
          }

          const falloff = smoothstep(1 - dist / INFLUENCE)
          const intensity = falloff * pointer.strength

          if (intensity <= 0.02) {
            drawBaseCell(col, row)
            continue
          }

          const clamped = Math.min(intensity, 1)
          const rampIndex = Math.min(RAMP.length - 1, Math.floor(clamped * RAMP.length))
          // Steady radial bulge that parts the field around the cursor.
          const displace = falloff * pointer.strength * (charW * DISPLACE)
          const nx = dist > 0.001 ? dx / dist : 0
          const ny = dist > 0.001 ? dy / dist : 0

          const r = Math.round(mutedRgb[0] + (accentRgb[0] - mutedRgb[0]) * clamped)
          const g = Math.round(mutedRgb[1] + (accentRgb[1] - mutedRgb[1]) * clamped)
          const b = Math.round(mutedRgb[2] + (accentRgb[2] - mutedRgb[2]) * clamped)
          const alpha = 0.13 + clamped * 0.8

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.fillText(RAMP[rampIndex], cx + nx * displace, cy + ny * displace)
        }
      }

      if (pointer.strength > 0.002 || pointer.target > 0) {
        frameId = window.requestAnimationFrame(renderFrame)
      } else {
        running = false
        drawStaticField()
      }
    }

    const start = () => {
      if (running || prefersReducedMotion) return
      running = true
      frameId = window.requestAnimationFrame(renderFrame)
    }

    const handleMove = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.target = 1
      start()
    }

    const handleLeave = () => {
      pointer.target = 0
    }

    let resizeTimer = 0
    const handleResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(build, 150)
    }

    build()

    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', handleMove, { passive: true })
      window.addEventListener('blur', handleLeave)
      document.addEventListener('mouseleave', handleLeave)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('blur', handleLeave)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="ascii-background" aria-hidden="true" />
}

export default AsciiBackground
