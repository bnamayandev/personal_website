import { useEffect, useRef } from 'react'

import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// Calm base field -> slightly denser glyphs the more the surface is disturbed.
// Kept light (no heavy #/0/@) so the field never shouts.
const RAMP = ['·', ':', '+', '*']
const BASE_CHAR = RAMP[0]

const FONT_SIZE = 13
const LINE_HEIGHT = 16

// The water simulation runs on its own SQUARE grid (decoupled from the text
// cells) so ripples stay circular and travel at the same speed in every
// direction, then the character field just samples that height surface.
const SIM_CELL = 10 // px per simulation cell (square)
const DAMPING = 0.983 // energy kept each step; near 1 => ripples cross the page
const DISTURB = 4.5 // height a single poke adds to the surface
const POKE_RADIUS = 2 // poke size, in sim cells
const HEIGHT_SCALE = 4 // surface height that maps to full brightness
const SLOPE = 0.65 // px a glyph slides per unit of surface slope (refraction)
const SETTLE = 0.12 // below this peak height the pool is treated as still
const STEP_SPACING = 9 // px between pokes dropped along the cursor path

// Guard rails so rapid input / high-refresh screens can't over-drive a weak client.
const FRAME_INTERVAL = 13 // ms between sim steps (~lets 60Hz run full, caps 120Hz+)
const MAX_POKES_PER_FRAME = 24 // bound the disturbances injected per frame
const MAX_HEIGHT = 12 // clamp the surface so spam can't blow up the amplitude

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
    // Ripples lift only slightly toward --muted (close to the base tone) so the
    // field stays a faint texture in the background's own colour family.
    const peakRgb = hexToRgb(styles.getPropertyValue('--muted') || '#8f897b')
    const fontStack = `${FONT_SIZE}px ${styles.getPropertyValue('--mono') || 'monospace'}`

    // Two height buffers, ping-ponged each step: a 2D wave field.
    let cur = new Float32Array(0)
    let prev = new Float32Array(0)
    let sw = 0 // sim grid width
    let sh = 0 // sim grid height

    // Text/render grid.
    let charW = 0
    let textCols = []
    let textRows = 0
    let dpr = 1
    let deviceW = 0
    let deviceH = 0

    let baseCanvas = null // pre-rendered calm field, blitted every frame
    // Pointer input is coalesced: handlers just record the latest position, and
    // the frame loop turns movement into pokes once per frame (capped).
    let pointerX = 0
    let pointerY = 0
    let pointerActive = false
    let lastPokeX = null
    let lastPokeY = null
    let lastFrameAt = 0
    let frameId = 0
    let running = false

    const setFontOn = (target) => {
      target.font = fontStack
      target.textBaseline = 'middle'
      target.textAlign = 'center'
    }

    const blitBase = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, deviceW, deviceH)
      if (baseCanvas) ctx.drawImage(baseCanvas, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Bilinear sample of the height field at a pixel position.
    const sample = (px, py) => {
      let fx = px / SIM_CELL
      let fy = py / SIM_CELL
      let ix = fx | 0
      let iy = fy | 0
      if (ix < 0) ix = 0
      else if (ix > sw - 2) ix = sw - 2
      if (iy < 0) iy = 0
      else if (iy > sh - 2) iy = sh - 2
      const tx = fx - ix
      const ty = fy - iy
      const i = iy * sw + ix
      const top = cur[i] + (cur[i + 1] - cur[i]) * tx
      const bot = cur[i + sw] + (cur[i + sw + 1] - cur[i + sw]) * tx
      return top + (bot - top) * ty
    }

    const build = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      deviceW = Math.floor(w * dpr)
      deviceH = Math.floor(h * dpr)
      canvas.width = deviceW
      canvas.height = deviceH
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setFontOn(ctx)

      sw = Math.ceil(w / SIM_CELL) + 1
      sh = Math.ceil(h / SIM_CELL) + 1
      cur = new Float32Array(sw * sh)
      prev = new Float32Array(sw * sh)

      charW = ctx.measureText('M').width || FONT_SIZE * 0.6
      const cols = Math.ceil(w / charW) + 1
      textRows = Math.ceil(h / LINE_HEIGHT) + 1

      // Let pretext lay the character stream into rows (no DOM reflow) and bake
      // the calm field once, so each animated frame is just a blit + ripples.
      const source = Array.from({ length: textRows }, () => BASE_CHAR.repeat(cols)).join('\n')
      const prepared = prepareWithSegments(source, fontStack, { whiteSpace: 'pre-wrap' })
      const lines = layoutWithLines(prepared, w, LINE_HEIGHT).lines.map((line) => line.text)
      textRows = lines.length
      textCols = lines.map((line) => line.length)

      baseCanvas = document.createElement('canvas')
      baseCanvas.width = deviceW
      baseCanvas.height = deviceH
      const bctx = baseCanvas.getContext('2d')
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setFontOn(bctx)
      bctx.fillStyle = `rgba(${mutedRgb[0]}, ${mutedRgb[1]}, ${mutedRgb[2]}, 0.06)`
      for (let row = 0; row < textRows; row += 1) {
        const y = row * LINE_HEIGHT + LINE_HEIGHT / 2
        for (let col = 0; col < textCols[row]; col += 1) {
          bctx.fillText(BASE_CHAR, col * charW + charW / 2, y)
        }
      }

      blitBase()
    }

    const processInput = () => {
      if (!pointerActive) return
      if (lastPokeX === null) {
        lastPokeX = pointerX
        lastPokeY = pointerY
        disturb(pointerX, pointerY)
        return
      }
      // Poke evenly along the path so a fast drag carves a smooth wake, but stop
      // after MAX_POKES_PER_FRAME so a violent flick can't flood the surface.
      let dx = pointerX - lastPokeX
      let dy = pointerY - lastPokeY
      let dist = Math.hypot(dx, dy)
      let pokes = 0
      while (dist >= STEP_SPACING && pokes < MAX_POKES_PER_FRAME) {
        const t = STEP_SPACING / dist
        lastPokeX += dx * t
        lastPokeY += dy * t
        disturb(lastPokeX, lastPokeY)
        dx = pointerX - lastPokeX
        dy = pointerY - lastPokeY
        dist = Math.hypot(dx, dy)
        pokes += 1
      }
      if (pokes >= MAX_POKES_PER_FRAME) {
        // Drop the backlog rather than spend later frames catching up.
        lastPokeX = pointerX
        lastPokeY = pointerY
      }
    }

    const stepAndRender = (now) => {
      // Throttle the work rate: 60Hz runs every frame, higher-refresh displays
      // (and rapid wake-ups) are capped instead of over-driving the simulation.
      if (now - lastFrameAt < FRAME_INTERVAL) {
        frameId = window.requestAnimationFrame(stepAndRender)
        return
      }
      lastFrameAt = now

      processInput()

      // 1. Propagate the wave field. Edges stay fixed, so ripples reflect.
      let peak = 0
      for (let y = 1; y < sh - 1; y += 1) {
        const base = y * sw
        for (let x = 1; x < sw - 1; x += 1) {
          const i = base + x
          let v = (cur[i - 1] + cur[i + 1] + cur[i - sw] + cur[i + sw]) * 0.5 - prev[i]
          v *= DAMPING
          if (v > MAX_HEIGHT) v = MAX_HEIGHT
          else if (v < -MAX_HEIGHT) v = -MAX_HEIGHT
          prev[i] = v
          const a = v < 0 ? -v : v
          if (a > peak) peak = a
        }
      }
      const swapBuf = cur
      cur = prev
      prev = swapBuf

      // 2. Repaint: calm field, then the disturbed glyphs sampled from the surface.
      blitBase()
      setFontOn(ctx)

      const half = LINE_HEIGHT / 2
      for (let row = 0; row < textRows; row += 1) {
        const y = row * LINE_HEIGHT + half
        const count = textCols[row]
        for (let col = 0; col < count; col += 1) {
          const x = col * charW + charW / 2
          const height = sample(x, y)
          const mag = height < 0 ? -height : height
          if (mag < SETTLE) continue

          // Surface slope refracts the glyph; height drives density + colour.
          const gx = sample(x + SIM_CELL, y) - sample(x - SIM_CELL, y)
          const gy = sample(x, y + SIM_CELL) - sample(x, y - SIM_CELL)
          const eased = smoothstep(Math.min(mag / HEIGHT_SCALE, 1))
          const rampIndex = Math.min(RAMP.length - 1, Math.floor(eased * RAMP.length))
          const r = Math.round(mutedRgb[0] + (peakRgb[0] - mutedRgb[0]) * eased)
          const g = Math.round(mutedRgb[1] + (peakRgb[1] - mutedRgb[1]) * eased)
          const b = Math.round(mutedRgb[2] + (peakRgb[2] - mutedRgb[2]) * eased)

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.06 + eased * 0.1})`
          ctx.fillText(RAMP[rampIndex], x - gx * SLOPE, y - gy * SLOPE)
        }
      }

      if (peak < SETTLE) {
        running = false
        lastPokeX = null
        lastPokeY = null
        blitBase()
        return
      }

      frameId = window.requestAnimationFrame(stepAndRender)
    }

    const start = () => {
      if (running || prefersReducedMotion) return
      running = true
      frameId = window.requestAnimationFrame(stepAndRender)
    }

    const disturb = (px, py) => {
      const centerX = Math.round(px / SIM_CELL)
      const centerY = Math.round(py / SIM_CELL)
      for (let dy = -POKE_RADIUS; dy <= POKE_RADIUS; dy += 1) {
        const y = centerY + dy
        if (y < 1 || y >= sh - 1) continue
        for (let dx = -POKE_RADIUS; dx <= POKE_RADIUS; dx += 1) {
          const x = centerX + dx
          if (x < 1 || x >= sw - 1) continue
          const d2 = dx * dx + dy * dy
          if (d2 > POKE_RADIUS * POKE_RADIUS) continue
          const i = y * sw + x
          let v = cur[i] + DISTURB * Math.exp(-d2 / 2)
          if (v > MAX_HEIGHT) v = MAX_HEIGHT
          else if (v < -MAX_HEIGHT) v = -MAX_HEIGHT
          cur[i] = v
        }
      }
    }

    const handleMove = (event) => {
      // Just record the latest position; the frame loop coalesces it into pokes.
      pointerX = event.clientX
      pointerY = event.clientY
      pointerActive = true
      start()
    }

    const handleLeave = () => {
      // Stop poking; the surface keeps rippling and settles on its own.
      pointerActive = false
      lastPokeX = null
      lastPokeY = null
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
      window.addEventListener('pointerup', handleLeave, { passive: true })
      window.addEventListener('pointercancel', handleLeave, { passive: true })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('blur', handleLeave)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('pointerup', handleLeave)
      window.removeEventListener('pointercancel', handleLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="ascii-background" aria-hidden="true" />
}

export default AsciiBackground
