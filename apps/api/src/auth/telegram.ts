import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export type TelegramAuthFields = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  [key: string]: unknown;
};

export type TelegramAuthData = TelegramAuthFields & { hash: string };

const MAX_AGE_SECONDS = 24 * 60 * 60;

// Checks the Telegram Login Widget signature:
// https://core.telegram.org/widgets/login#checking-authorization
export function verifyTelegramAuth(
  data: TelegramAuthData,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const { hash, ...fields } = data;
  const checkString = Object.keys(fields)
    .filter((key) => fields[key] !== undefined && fields[key] !== null)
    .sort()
    .map((key) => `${key}=${String(fields[key])}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();
  const expected = createHmac('sha256', secretKey)
    .update(checkString)
    .digest();
  const actual = Buffer.from(hash, 'hex');

  if (actual.length !== expected.length) return false;
  if (!timingSafeEqual(actual, expected)) return false;
  return nowSeconds - data.auth_date <= MAX_AGE_SECONDS;
}
