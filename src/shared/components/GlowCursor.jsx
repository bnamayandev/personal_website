import { useEffect, useRef } from 'react'

function GlowCursor() {
  const dotRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) {
      return undefined
    }

    const dot = dotRef.current
    const glow = glowRef.current
    if (!dot || !glow) {
      return undefined
    }

    const root = document.documentElement
    root.classList.add('has-glow-cursor')

    let visible = false

    const handleMove = (event) => {
      const transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`
      dot.style.transform = transform
      glow.style.transform = transform

      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        glow.style.opacity = '1'
      }
    }

    const handleOver = (event) => {
      const interactive = event.target.closest?.('a, button, [role="button"]')
      glow.classList.toggle('is-link', Boolean(interactive))
    }

    const handleLeave = () => {
      visible = false
      dot.style.opacity = '0'
      glow.style.opacity = '0'
    }

    const handleDown = () => glow.classList.add('is-down')
    const handleUp = () => glow.classList.remove('is-down')

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      root.classList.remove('has-glow-cursor')
    }
  }, [])

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

export default GlowCursor
