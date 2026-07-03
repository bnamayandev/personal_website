export function createTerminalController() {
  let buffer = ''
  let subscriber = null
  let flushScheduled = false

  let mode = 'idle'
  let keyResolve = null
  let keyTimer = null
  const pendingKeys = []
  let lineResolve = null
  let lineBuffer = ''

  function scheduleFlush() {
    if (flushScheduled) return
    flushScheduled = true
    queueMicrotask(() => {
      flushScheduled = false
      if (subscriber) subscriber(buffer)
    })
  }

  function write(text) {
    buffer += text
    scheduleFlush()
  }

  function clear() {
    buffer = ''
    scheduleFlush()
  }

  function settleKey(char) {
    if (keyTimer) {
      clearTimeout(keyTimer)
      keyTimer = null
    }
    const resolve = keyResolve
    keyResolve = null
    mode = 'idle'
    resolve(char)
  }

  const bridge = {
    write,
    clear,

    getKey(timeoutMs) {
      if (pendingKeys.length > 0) {
        return Promise.resolve(pendingKeys.shift())
      }
      return new Promise((resolve) => {
        mode = 'key'
        keyResolve = resolve
        if (timeoutMs >= 0) {
          keyTimer = setTimeout(() => {
            keyTimer = null
            const r = keyResolve
            keyResolve = null
            mode = 'idle'
            r('')
          }, timeoutMs)
        }
      })
    },

    readLine(promptText) {
      if (promptText) write(promptText)
      return new Promise((resolve) => {
        mode = 'line'
        lineBuffer = ''
        lineResolve = resolve
      })
    },
  }

  function feedKey(event) {
    const key = event.key

    if (mode === 'line') {
      if (key === 'Enter') {
        write('\n')
        const resolve = lineResolve
        const value = lineBuffer
        lineResolve = null
        lineBuffer = ''
        mode = 'idle'
        resolve(value)
        return true
      }
      if (key === 'Backspace') {
        if (lineBuffer.length > 0) {
          lineBuffer = lineBuffer.slice(0, -1)
          buffer = buffer.slice(0, -1)
          scheduleFlush()
        }
        return true
      }
      if (key && key.length === 1) {
        lineBuffer += key
        write(key)
        return true
      }
      return false
    }

    if (key && key.length === 1) {
      if (mode === 'key' && keyResolve) {
        settleKey(key)
      } else {
        pendingKeys.push(key)
      }
      return true
    }
    return false
  }

  function reset() {
    buffer = ''
    mode = 'idle'
    if (keyTimer) {
      clearTimeout(keyTimer)
      keyTimer = null
    }
    keyResolve = null
    lineResolve = null
    lineBuffer = ''
    pendingKeys.length = 0
    scheduleFlush()
  }

  return {
    bridge,
    feedKey,
    reset,
    subscribe(callback) {
      subscriber = callback
    },
    getBuffer() {
      return buffer
    },
  }
}
