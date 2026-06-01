const dotenv = require('dotenv');

// Load biến môi trường TRƯỚC tất cả (quan trọng!)
dotenv.config();

const app = require('./src/app.js');
const connectDB = require('./src/config/db.js');

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB rồi mới start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });
});