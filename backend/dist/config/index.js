"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Helper to manually load .env file if it exists
function loadEnv() {
    const envPath = path_1.default.resolve(__dirname, '../../.env');
    if (fs_1.default.existsSync(envPath)) {
        const content = fs_1.default.readFileSync(envPath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
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
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vedaai',
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
};
// Validate critical configuration (fail close)
if (!exports.config.mongoUri) {
    console.error('CRITICAL: MONGO_URI configuration is missing.');
    process.exit(1);
}
if (!exports.config.anthropicApiKey || exports.config.anthropicApiKey === 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx') {
    console.warn('WARNING: ANTHROPIC_API_KEY is not configured or uses a placeholder. Paper generation will fall back to mock service.');
}
