import { getSessionToken } from './auth-utils'

/**
 * Enhanced fetch wrapper that automatically adds Authorization header
 * from the stored session token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getSessionToken()
  
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
    console.log('[v0] Added Authorization header to request:', url)
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}
