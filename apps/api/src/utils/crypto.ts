import crypto from 'node:crypto';
import argon2 from 'argon2';
import { env } from '../env.js';

export const hashPassword = (pwd: string) => argon2.hash(pwd, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
export const verifyPassword = (hash: string, pwd: string) => argon2.verify(hash, pwd);

export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('base64url'); }
export function sha256(data: string) { return crypto.createHash('sha256').update(data).digest('hex'); }

const key = Buffer.from(env.TOTP_ENC_KEY_B64, 'base64');
export function encrypt(str: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${enc.toString('base64')}.${tag.toString('base64')}`;
}
export function decrypt(payload: string): string {
  const [ivB64, dataB64, tagB64] = payload.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}