import { useEffect, useRef, useState } from 'react'

import { ansiToSegments } from './ansi'
import { createTerminalController } from './terminalController'
import { runBikeGame } from './pyodideRuntime'

function BikeTerminal() {
  const controllerRef = useRef(null)
  if (!controllerRef.current) {
    controllerRef.current = createTerminalController()
  }
  const controller = controllerRef.current

  const screenRef = useRef(null)
  const [screen, setScreen] = useState('')
  const [status, setStatus] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    controller.subscribe(setScreen)
    return () => controller.subscribe(null)
  }, [controller])

  useEffect(() => {
    const el = screenRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [screen])

  useEffect(() => {
    if (status !== 'running') return undefined
    const handler = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const consumed = controller.feedKey(event)
      if (consumed || event.key === ' ' || event.key === 'Backspace' || event.key === 'Enter') {
        event.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [status, controller])

  const boot = async () => {
    if (status === 'booting' || status === 'running') return
    controller.reset()
    setStatus('booting')
    setStatusMsg('booting python…')
    try {
      await runBikeGame(controller, {
        onStatus: (msg) => setStatusMsg(msg),
        onReady: () => {
          setStatus('running')
          setStatusMsg('')
        },
      })
      setStatus('ended')
    } catch (err) {
      console.error('Bike for Your Life crashed:', err)
      setStatus('error')
      setStatusMsg('the game hit an error — details are in the console')
    }
  }

  const segments = ansiToSegments(screen)
  const showCaret = status === 'running'

  return (
    <div className="term">
      <div className="term-screen" ref={screenRef}>
        {status === 'idle' ? (
          <div className="term-boot">
            <button type="button" className="term-btn" onClick={boot}>
              ▸ boot the game
            </button>
            <p className="term-boot-note">
              this runs the actual python for the game, compiled to webassembly, right here in
              your browser. it downloads a few MB the first time, then it&apos;s cached.
            </p>
          </div>
        ) : (
          <pre className="term-pre" aria-live="polite">
            {segments.map((segment, index) => (
              <span key={index} style={segment.style}>
                {segment.text}
              </span>
            ))}
            {showCaret && <span className="term-caret">▍</span>}
          </pre>
        )}

        {(status === 'booting' || status === 'error') && statusMsg && (
          <div className="term-status">{statusMsg}</div>
        )}

        {status === 'ended' && (
          <button type="button" className="term-btn term-again" onClick={boot}>
            ▸ run it again
          </button>
        )}
      </div>
    </div>
  )
}

export default BikeTerminal
