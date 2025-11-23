const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
require('dotenv').config();

const sentimentService = require('./services/sentimentService');
const geminiService = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// API info endpoint (for development/testing)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'AI Feedback Analyzer API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyze: 'POST /api/analyze',
      recommendations: 'POST /api/recommendations'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Upload and analyze CSV endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CSV
    const csvText = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    if (parseResult.errors.length > 0) {
      return res.status(400).json({ error: 'Invalid CSV format', details: parseResult.errors });
    }

    const data = parseResult.data;

    // Find review column (case-insensitive)
    const headers = Object.keys(data[0] || {});
    const reviewColumn = headers.find(h => h.toLowerCase() === 'review');

    if (!reviewColumn) {
      return res.status(400).json({ 
        error: 'CSV must contain a "review" column (case-insensitive)',
        availableColumns: headers 
      });
    }

    // Extract reviews
    const reviews = data
      .map(row => row[reviewColumn])
      .filter(review => review && review.trim() !== '');

    if (reviews.length === 0) {
      return res.status(400).json({ error: 'No valid reviews found in CSV' });
    }

    // Perform sentiment analysis
    console.log(`Analyzing ${reviews.length} reviews...`);
    const results = await sentimentService.analyzeReviews(reviews);

    res.json({
      success: true,
      totalReviews: reviews.length,
      results: results
    });

  } catch (error) {
    console.error('Error analyzing reviews:', error);
    res.status(500).json({ error: 'Failed to analyze reviews', message: error.message });
  }
});

// Get AI recommendations for negative reviews
app.post('/api/recommendations', async (req, res) => {
  try {
    const { negativeReviews, maxReviews = 100, chunkSize = 50 } = req.body;

    if (!negativeReviews || !Array.isArray(negativeReviews)) {
      return res.status(400).json({ error: 'Invalid request: negativeReviews array required' });
    }

    if (negativeReviews.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No negative reviews to analyze',
        recommendations: 'All reviews are positive! Keep up the great work! 🎉'
      });
    }

    // Limit reviews
    const reviewsToAnalyze = negativeReviews.slice(0, maxReviews);
    
    console.log(`Generating recommendations for ${reviewsToAnalyze.length} negative reviews...`);
    const recommendations = await geminiService.analyzeAndRecommend(reviewsToAnalyze, chunkSize);

    res.json({
      success: true,
      analyzedCount: reviewsToAnalyze.length,
      recommendations: recommendations
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', message: error.message });
  }
});

// Serve frontend build (single-container deploy)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
