import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getSecretKey(): Buffer {
  const key = process.env.CREDENTIAL_SECRET_KEY;
  if (!key) throw new Error('CREDENTIAL_SECRET_KEY belum diset di environment variable');
  return Buffer.from(key, 'hex');
}

export function encryptCredentials(data: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);

  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptCredentials(encryptedString: string): Record<string, unknown> {
  const [ivHex, authTagHex, encrypted] = encryptedString.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
