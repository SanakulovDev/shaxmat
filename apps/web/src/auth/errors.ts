import { ApiError } from '../api/client'

const KEY_BY_STATUS: Record<number, string> = {
  400: 'auth.errors.invalidInput',
  401: 'auth.errors.invalidCredentials',
  409: 'auth.errors.emailTaken',
  429: 'auth.errors.tooManyRequests',
}

// Maps an API error to an i18n key. The API sends English messages; the UI
// shows its own Uzbek text.
export function authErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    return KEY_BY_STATUS[error.status] ?? 'auth.errors.unknown'
  }
  return 'auth.errors.unknown'
}
