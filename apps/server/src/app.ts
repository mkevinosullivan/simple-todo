import cors from 'cors';
import express, { type Express } from 'express';

import celebrationsRouter from './routes/celebrations.js';
import configRouter from './routes/config.js';
import healthRouter from './routes/health.js';
import tasksRouter from './routes/tasks.js';

const app: Express = express();

// CORS middleware - allow frontend origin
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// JSON body parser middleware
app.use(express.json());

// Routes
app.use('/api/celebrations', celebrationsRouter);
app.use('/api/config', configRouter);
app.use('/api/health', healthRouter);
app.use('/api/tasks', tasksRouter);

export default app;
