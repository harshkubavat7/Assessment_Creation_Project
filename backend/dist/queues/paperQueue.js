"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperQueue = exports.connection = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
exports.connection = new ioredis_1.default(config_1.config.redisUrl, {
    maxRetriesPerRequest: null,
    reconnectOnError: (err) => {
        console.error('Redis connection error:', err);
        return true; // try to reconnect
    }
});
exports.connection.on('error', (err) => {
    console.error('Redis client error:', err);
});
exports.paperQueue = new bullmq_1.Queue('paper-generation', { connection: exports.connection });
