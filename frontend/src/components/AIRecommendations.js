import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './AIRecommendations.css';

const AIRecommendations = ({ results }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const negativeReviews = results.results
    .filter(r => r.sentiment === 'negative')
    .sort((a, b) => b.confidence - a.confidence)
    .map(r => r.cleanedText);

  const generateRecommendations = async () => {
    if (negativeReviews.length === 0) {
      setRecommendations('🎉 No negative reviews found! Your feedback is overwhelmingly positive. Keep up the excellent work!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/recommendations', {
        negativeReviews: negativeReviews,
        maxReviews: 100,
        chunkSize: 50
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      } else {
        setError('Failed to generate recommendations');
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      setError(err.response?.data?.error || 'Failed to generate AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadRecommendations = () => {
    const blob = new Blob([recommendations], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_recommendations.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="ai-recommendations">
      <h2>🤖 Step 3: AI-Powered Recommendations</h2>

      {!recommendations && !loading && (
        <div className="generate-section">
          <div className="info-box">
            <p>
              <strong>📊 Negative Reviews Found: {negativeReviews.length}</strong>
            </p>
            <p>
              Generate AI-powered insights and actionable recommendations based on the negative feedback.
            </p>
          </div>
          
          <button 
            className="generate-button" 
            onClick={generateRecommendations}
            disabled={loading}
          >
            🧠 Generate AI Recommendations
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-recommendations">
          <div className="spinner-large"></div>
          <p>🤖 AI is analyzing feedback...</p>
          <p className="loading-subtext">This may take a minute</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>❌ {error}</p>
          <button onClick={generateRecommendations}>Try Again</button>
        </div>
      )}

      {recommendations && !loading && (
        <div className="recommendations-content">
          <div className="recommendations-header">
            <h3>🧠 AI Insights & Recommendations</h3>
            <button className="download-rec-button" onClick={downloadRecommendations}>
              ⬇️ Download Report
            </button>
          </div>
          
          <div className="markdown-content">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
