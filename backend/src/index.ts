import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { initWebSocket } from './ws/socketManager';
import { initWorker } from './workers/paperGenWorker';
import assignmentRoutes from './routes/assignments';
import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import toolkitRoutes from './routes/toolkit';
import { config } from './config';

const app = express();

app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use('/api/auth', authRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', groupRoutes);
app.use('/api', toolkitRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'VedaAI Backend Gateway is running.',
    endpoints: {
      assignments: '/api/assignments'
    }
  });
});

// Diagnostic route to test Gemini API connectivity and credentials
app.get('/api/test-gemini', async (req, res) => {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    return res.json({ error: 'GEMINI_API_KEY is not set in environment variables.' });
  }
  
  const modelName = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "API is working"' }] }]
      })
    });
    
    const text = await response.text();
    res.json({
      status: response.status,
      statusText: response.statusText,
      keyLength: apiKey.length,
      keySnippet: apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4),
      response: text.startsWith('{') ? JSON.parse(text) : text
    });
  } catch (err: any) {
    res.json({ error: err.message });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled internal server error:', err);
  res.status(500).json({ error: 'An unexpected internal error occurred.' });
});

const httpServer = createServer(app);
initWebSocket(httpServer);

console.log(`Connecting to MongoDB at: ${config.mongoUri}`);
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Initialize BullMQ background worker
    initWorker();
    
    // Bind server to 0.0.0.0 to accept loopback connections on both localhost and 127.0.0.1
    const host = '0.0.0.0';
    
    httpServer.listen(config.port, host, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://${host}:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: MongoDB connection failed. Server shutting down.', err);
    process.exit(1);
  });
