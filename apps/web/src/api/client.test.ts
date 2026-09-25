import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, refreshSession, setSession } from './client'

const user = {
  id: 'u1',
  email: 'a@b.uz',
  name: 'Anvar',
  avatarUrl: null,
  isGuest: false,
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mockFetch(handler: (url: string, init: RequestInit) => Response) {
  const fetchMock = vi.fn((url: string, init: RequestInit) =>
    Promise.resolve(handler(url, init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSession(null)
})

describe('api client', () => {
  it('sends the access token', async () => {
    setSession({ accessToken: 'token-1', user })
    const fetchMock = mockFetch(() => json(200, { ok: true }))

    await api('/auth/me')

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer token-1')
  })

  it('refreshes once and retries after a 401', async () => {
    setSession({ accessToken: 'expired', user })
    const fetchMock = mockFetch((url, init) => {
      if (url === '/api/auth/refresh') {
        return json(200, { accessToken: 'fresh', user })
      }
      const auth = (init.headers as Headers).get('Authorization')
      return auth === 'Bearer fresh' ? json(200, user) : json(401, {})
    })

    await expect(api('/auth/me')).resolves.toEqual(user)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth/me',
      '/api/auth/refresh',
      '/api/auth/me',
    ])
  })

  it('shares one refresh request between parallel callers', async () => {
    const fetchMock = mockFetch(() => json(200, { accessToken: 't', user }))

    const [a, b] = await Promise.all([refreshSession(), refreshSession()])

    expect(a).toEqual(b)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws ApiError with the status and server message', async () => {
    mockFetch(() => json(409, { message: 'Email already registered' }))

    const error = await api('/auth/register', { method: 'POST', body: {} })
      .then(() => null)
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      message: 'Email already registered',
    })
  })
})
