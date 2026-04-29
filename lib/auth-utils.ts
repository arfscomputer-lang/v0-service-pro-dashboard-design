/**
 * Get the session token from browser storage
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const token = sessionStorage.getItem('sp_auth_token')
    return token
  } catch (error) {
    console.error('[v0] Error reading session token:', error)
    return null
  }
}

/**
 * Store the session token in browser storage
 */
export function setSessionToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    sessionStorage.setItem('sp_auth_token', token)
    console.log('[v0] Session token stored in sessionStorage')
  } catch (error) {
    console.error('[v0] Error storing session token:', error)
  }
}

/**
 * Clear the session token
 */
export function clearSessionToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    sessionStorage.removeItem('sp_auth_token')
    console.log('[v0] Session token cleared')
  } catch (error) {
    console.error('[v0] Error clearing session token:', error)
  }
}
