import terminalPy from './py/terminal.py?raw'
import gamePy from './py/game.py?raw'
import cliPy from './py/cli.py?raw'
import statePy from './py/state.py?raw'
import statsPy from './py/stats.py?raw'
import passagesPy from './py/passages.py?raw'
import initPy from './py/__init__.py?raw'

const PYODIDE_VERSION = '0.28.0'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodidePromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (globalThis.loadPyodide) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.pyodide = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Pyodide from the CDN.'))
    document.head.appendChild(script)
  })
}

function getPyodide(onStatus) {
  if (pyodidePromise) return pyodidePromise

  pyodidePromise = (async () => {
    onStatus?.('downloading python…')
    await loadScript(`${PYODIDE_BASE}pyodide.js`)

    onStatus?.('starting python…')
    const pyodide = await globalThis.loadPyodide({ indexURL: PYODIDE_BASE })

    const dir = '/game/bike_for_your_life'
    pyodide.FS.mkdirTree(dir)
    const files = {
      '__init__.py': initPy,
      'state.py': statePy,
      'stats.py': statsPy,
      'passages.py': passagesPy,
      'terminal.py': terminalPy,
      'game.py': gamePy,
      'cli.py': cliPy,
    }
    for (const [name, contents] of Object.entries(files)) {
      pyodide.FS.writeFile(`${dir}/${name}`, contents)
    }
    pyodide.runPython("import sys\nif '/game' not in sys.path:\n    sys.path.insert(0, '/game')")

    return pyodide
  })()

  return pyodidePromise
}

export async function runBikeGame(controller, { onStatus, onReady } = {}) {
  const pyodide = await getPyodide(onStatus)

  const outDecoder = new TextDecoder('utf-8')
  const errDecoder = new TextDecoder('utf-8')
  pyodide.setStdout({
    write: (buf) => {
      controller.bridge.write(outDecoder.decode(buf, { stream: true }))
      return buf.length
    },
  })
  pyodide.setStderr({
    write: (buf) => {
      controller.bridge.write(errDecoder.decode(buf, { stream: true }))
      return buf.length
    },
  })

  globalThis.bikeBridge = controller.bridge

  onReady?.()

  try {
    await pyodide.runPythonAsync('from bike_for_your_life.cli import main\nawait main()')
  } catch (err) {
    const isExit = err && (err.type === 'SystemExit' || String(err.message || err).includes('SystemExit'))
    if (!isExit) throw err
  }
}
