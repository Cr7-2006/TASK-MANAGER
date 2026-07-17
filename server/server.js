const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    /https?:\/\/.*\.onrender\.com$/,
    /https?:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Serve static assets in production if frontend build exists
const distPath = path.join(__dirname, '../client/dist');
const indexPath = path.resolve(__dirname, '../client', 'dist', 'index.html');

if (process.env.NODE_ENV === 'production' && fs.existsSync(indexPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  // Root endpoint for health check / local testing in development or standalone backend mode
  app.get('/', (req, res) => {
    res.json({ message: 'Task Manager API is running...' });
  });
}

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
