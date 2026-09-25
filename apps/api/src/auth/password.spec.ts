import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('verifies the password it hashed', async () => {
    const stored = await hashPassword('correct horse');
    expect(stored.startsWith('scrypt$')).toBe(true);
    await expect(verifyPassword('correct horse', stored)).resolves.toBe(true);
  });

  it('rejects a different password', async () => {
    const stored = await hashPassword('correct horse');
    await expect(verifyPassword('battery staple', stored)).resolves.toBe(false);
  });

  it('uses a new salt for every hash', async () => {
    const [a, b] = await Promise.all([hashPassword('x'), hashPassword('x')]);
    expect(a).not.toBe(b);
  });

  it('rejects a malformed stored value', async () => {
    await expect(verifyPassword('x', 'md5$abc')).resolves.toBe(false);
  });
});
