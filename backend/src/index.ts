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
