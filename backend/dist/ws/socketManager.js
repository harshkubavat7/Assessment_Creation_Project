"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.broadcast = broadcast;
const ws_1 = require("ws");
const clients = new Set();
function initWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        clients.add(ws);
        ws.on('error', (error) => {
            console.error('WebSocket client error:', error);
        });
        ws.on('close', () => {
            clients.delete(ws);
        });
    });
    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
}
function broadcast(data) {
    const payload = JSON.stringify(data);
    clients.forEach(ws => {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            try {
                ws.send(payload);
            }
            catch (err) {
                console.error('Error broadcasting to client:', err);
                clients.delete(ws);
            }
        }
    });
}
