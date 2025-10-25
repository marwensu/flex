const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();

const reviewsRouter = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/reviews", reviewsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Flex Living Reviews API is running",
    timestamp: new Date().toISOString()
  });
});

// API Info
app.get("/api", (req, res) => {
  res.json({
    name: "Flex Living Reviews API",
    version: "1.0.0",
    description: "API for managing property reviews from Hostaway",
    endpoints: {
      "GET /api/reviews/hostaway": "Get all reviews",
      "GET /api/reviews/search": "Search reviews with filters",
      "GET /api/reviews/stats": "Get review statistics",
      "GET /api/reviews/:id": "Get a specific review",
      "POST /api/reviews/:id/approve": "Approve a review",
      "GET /api/reviews/approved": "Get all approved reviews",
      "GET /health": "Health check"
    },
    config: {
      accountId: process.env.HOSTAWAY_ACCOUNT_ID,
      apiKeyConfigured: !!process.env.HOSTAWAY_API_KEY
    }
  });
});

// Root
app.get("/", (req, res) => {
  res.json({ 
    message: "Flex Living Reviews API",
    documentation: "/api"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Only start server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n🚀 ====================================');
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Reviews API: http://localhost:${PORT}/api/reviews/hostaway`);
    console.log(` Statistics: http://localhost:${PORT}/api/reviews/stats`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(` Account ID: ${process.env.HOSTAWAY_ACCOUNT_ID}`);
    console.log(` API Key: ${process.env.HOSTAWAY_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
    console.log('====================================\n');
  });
}

// Export for Vercel serverless
module.exports = app;
module.exports.handler = (req, res) => app(req, res);
