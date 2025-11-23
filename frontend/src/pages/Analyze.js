import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import SentimentResults from '../components/SentimentResults';
import AIRecommendations from '../components/AIRecommendations';
import './Analyze.css';

const Analyze = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnalysisResults(null);
  };

  const handleReset = () => {
    setAnalysisResults(null);
    setError(null);
    setLoading(false);
  };

  return (
    <motion.div
      className="analyze-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="analyze-container">
        <motion.div
          className="page-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="gradient-text">Analyze Feedback</h1>
          <p>Upload your CSV file to get started with AI-powered sentiment analysis</p>
        </motion.div>

        {error && (
          <motion.div
            className="error-banner"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span>❌ {error}</span>
            <button onClick={handleReset} className="retry-btn">Try Again</button>
          </motion.div>
        )}

        {!analysisResults ? (
          <FileUpload
            onAnalysisComplete={handleAnalysisComplete}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="reset-section">
              <button className="reset-button" onClick={handleReset}>
                📁 Upload New File
              </button>
            </div>

            <SentimentResults results={analysisResults} />
            <AIRecommendations results={analysisResults} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Analyze;
