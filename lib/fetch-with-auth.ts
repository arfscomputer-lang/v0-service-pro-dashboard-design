// HTTP Client with automatic token injection
// Includes Authorization header in all requests

interface FetchOptions extends RequestInit {
  headers?: HeadersInit
}

/**
 * Fetch wrapper that automatically includes the auth token
 * from sessionStorage in the Authorization header
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('sp_auth_token') : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Convenience wrapper for JSON responses
 */
export async function fetchWithAuthJson<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options)
  
  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sp_auth_token')
      }
      throw new Error('Unauthorized - please login again')
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
