const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// === Middleware ===

// Bảo mật HTTP headers
app.use(helmet());

// Log HTTP requests (chỉ khi develop)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Cho phép frontend gọi API (Cross-Origin)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Cho phép gửi cookie
}));

// Parse JSON body từ request
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded body (form data)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Serve static files (ảnh upload)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// === Routes ===
const routes = require('./routes');
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🅿️ ParkingSlot API is running!',
    timestamp: new Date().toISOString(),
  });
});

// === Error Handler (sẽ hoàn thiện sau) ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;