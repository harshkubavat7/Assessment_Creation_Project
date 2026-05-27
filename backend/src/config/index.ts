import fs from 'fs';
import path from 'path';

// Helper to manually load .env file if it exists
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

import crypto from 'crypto';

// Helper to resolve secret dynamically (Environment -> Local File -> Ephemeral Random Gen)
function getSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const localSecretPath = path.resolve(__dirname, '../../jwt_secret.txt');
  if (fs.existsSync(localSecretPath)) {
    return fs.readFileSync(localSecretPath, 'utf-8').trim();
  }
  console.warn('WARNING: JWT_SECRET environment variable is missing. Generating ephemeral instance-isolated secret.');
  const ephemeral = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(localSecretPath, ephemeral, { mode: 0o600 });
    return ephemeral;
  } catch (err) {
    return ephemeral;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vedaai',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: getSecret()
};

// Validate critical configuration (fail close)
if (!config.mongoUri) {
  console.error('CRITICAL: MONGO_URI configuration is missing.');
  process.exit(1);
}

if (!config.geminiApiKey || config.geminiApiKey === 'mock-api-key-for-local-testing') {
  console.warn('WARNING: GEMINI_API_KEY is not configured or uses a placeholder. Paper generation will fall back to mock service.');
}
