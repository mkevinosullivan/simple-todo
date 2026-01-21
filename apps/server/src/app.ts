import cors from 'cors';
import express, { type Express } from 'express';

import healthRouter from './routes/health.js';

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
app.use('/api/health', healthRouter);

export default app;
