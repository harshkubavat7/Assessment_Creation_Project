import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// 1. Password Hashing Utility using native scrypt
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate 16 byte salt
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      // Format: salt:hash
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return resolve(false);
    
    const [salt, hash] = parts;
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex') === hash);
    });
  });
}

// 2. Symmetric AES-256-GCM Session Token Utility
export function generateToken(payload: { userId: string }): string {
  // Ensure the secret is exactly 32 bytes (256 bits) for aes-256
  const key = crypto.createHash('sha256').update(config.jwtSecret).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Set token expiration (e.g. 7 days from now)
  const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const tokenData = {
    ...payload,
    exp: expiration
  };
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(tokenData), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:encrypted:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const key = crypto.createHash('sha256').update(config.jwtSecret).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const parsed = JSON.parse(decrypted);
    
    // Validate expiration
    if (!parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    
    return { userId: parsed.userId };
  } catch (err) {
    return null;
  }
}
