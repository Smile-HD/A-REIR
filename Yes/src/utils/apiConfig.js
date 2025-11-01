// Prefer Vite's import.meta.env for environment variables in the browser.
// Keep a fallback string for environments where import.meta is not available.
const API_BASE = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_BASE)
	|| (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE)
	|| 'http://localhost:3000'

export { API_BASE }
