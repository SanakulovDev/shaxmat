export type PublicUser = {
  id: string
  email: string | null
  name: string
  avatarUrl: string | null
  isGuest: boolean
}

export type AuthResponse = { accessToken: string; user: PublicUser }

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type SessionListener = (session: AuthResponse | null) => void

// The access token lives only in memory. The refresh token is an httpOnly
// cookie that JavaScript cannot read.
let accessToken: string | null = null
let sessionListener: SessionListener = () => {}
let refreshInFlight: Promise<AuthResponse | null> | null = null

export function setSession(session: AuthResponse | null) {
  accessToken = session?.accessToken ?? null
  sessionListener(session)
}

export function onSessionChange(listener: SessionListener) {
  sessionListener = listener
}

// Refresh tokens are single-use on the server, so parallel callers must
// share one refresh request.
export function refreshSession(): Promise<AuthResponse | null> {
  refreshInFlight ??= (async () => {
    try {
      const response = await send('/auth/refresh', 'POST')
      const session = response.ok
        ? ((await response.json()) as AuthResponse)
        : null
      setSession(session)
      return session
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  // Refresh the session once and retry when the server answers 401.
  retryOnUnauthorized?: boolean
}

export async function api<T>(
  path: string,
  { method = 'GET', body, retryOnUnauthorized = true }: RequestOptions = {},
): Promise<T> {
  let response = await send(path, method, body)

  if (response.status === 401 && retryOnUnauthorized && accessToken) {
    const session = await refreshSession()
    if (session) response = await send(path, method, body)
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

function send(path: string, method: string, body?: unknown) {
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  })
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown }
    return Array.isArray(data.message)
      ? data.message.join(', ')
      : String(data.message ?? response.statusText)
  } catch {
    return response.statusText
  }
}
