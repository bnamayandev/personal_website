// In dev the frontend runs on Vite (5173) while the Express API runs on 3001,
// so point at it directly. In prod the same server serves the built site, so
// relative requests work.
export const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''
