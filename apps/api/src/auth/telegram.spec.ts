import { createHash, createHmac } from 'node:crypto';
import {
  type TelegramAuthData,
  type TelegramAuthFields,
  verifyTelegramAuth,
} from './telegram.js';

const BOT_TOKEN = '123456:TEST-TOKEN';
const NOW = 1_800_000_000;

// Signs data the same way Telegram does, as an independent reference.
function sign(fields: TelegramAuthFields): TelegramAuthData {
  const checkString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('\n');
  const secret = createHash('sha256').update(BOT_TOKEN).digest();
  const hash = createHmac('sha256', secret).update(checkString).digest('hex');
  return { ...fields, hash };
}

const fields = {
  id: 42,
  first_name: 'Anvar',
  username: 'anvar',
  auth_date: NOW - 60,
};

describe('verifyTelegramAuth', () => {
  it('accepts correctly signed data', () => {
    expect(verifyTelegramAuth(sign(fields), BOT_TOKEN, NOW)).toBe(true);
  });

  it('accepts fields that the schema does not name', () => {
    const data = sign({ ...fields, allows_write_to_pm: true });
    expect(verifyTelegramAuth(data, BOT_TOKEN, NOW)).toBe(true);
  });

  it('rejects changed data', () => {
    const data = { ...sign(fields), id: 43 };
    expect(verifyTelegramAuth(data, BOT_TOKEN, NOW)).toBe(false);
  });

  it('rejects data signed with another bot token', () => {
    expect(verifyTelegramAuth(sign(fields), '999:OTHER', NOW)).toBe(false);
  });

  it('rejects data older than 24 hours', () => {
    const data = sign({ ...fields, auth_date: NOW - 24 * 60 * 60 - 1 });
    expect(verifyTelegramAuth(data, BOT_TOKEN, NOW)).toBe(false);
  });

  it('rejects a hash with the wrong length', () => {
    const data = { ...sign(fields), hash: 'abcd' };
    expect(verifyTelegramAuth(data, BOT_TOKEN, NOW)).toBe(false);
  });
});
