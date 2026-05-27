import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const clients = new Set<WebSocket>();

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

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

export function broadcast(data: object) {
  const payload = JSON.stringify(data);
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
        clients.delete(ws);
      }
    }
  });
}
