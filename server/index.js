import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { router } from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0"
  });
});

// API Routes
// app.use('/api', router);
const allowedOrigins = [
  "http://localhost:5173",
  "https://tiny-link-4wcw0rzzw-varun07ps-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


// Error Handling Middleware
import { errorHandler } from './middleware/errorMiddleware.js';
app.use(errorHandler);

// Redirect Route (Catch-all for short codes, but be careful not to catch API routes if they overlap, though /api is specific)
// We'll handle the redirect in the routes or directly here. 
// Given the spec: GET /:code
import { handleRedirect } from './controllers.js';
app.get('/:code', handleRedirect);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
