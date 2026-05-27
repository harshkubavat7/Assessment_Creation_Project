"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socketManager_1 = require("./ws/socketManager");
const paperGenWorker_1 = require("./workers/paperGenWorker");
const assignments_1 = __importDefault(require("./routes/assignments"));
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
    credentials: true
}));
app.use(express_1.default.json({ limit: '20mb' }));
app.use('/api', assignments_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled internal server error:', err);
    res.status(500).json({ error: 'An unexpected internal error occurred.' });
});
const httpServer = (0, http_1.createServer)(app);
(0, socketManager_1.initWebSocket)(httpServer);
console.log(`Connecting to MongoDB at: ${config_1.config.mongoUri}`);
mongoose_1.default.connect(config_1.config.mongoUri)
    .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize BullMQ background worker
    (0, paperGenWorker_1.initWorker)();
    // Bind server to 127.0.0.1 in development for secure testing
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    httpServer.listen(config_1.config.port, host, () => {
        console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://${host}:${config_1.config.port}`);
    });
})
    .catch((err) => {
    console.error('CRITICAL: MongoDB connection failed. Server shutting down.', err);
    process.exit(1);
});
