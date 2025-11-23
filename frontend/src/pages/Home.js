import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaBrain, FaChartLine, FaGem } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FaBrain />,
      title: 'AI-Powered Analysis',
      description: 'Advanced RoBERTa transformer model for accurate sentiment detection',
      color: '#6366f1'
    },
    {
      icon: <FaChartLine />,
      title: 'Real-time Insights',
      description: 'Get instant feedback analysis with confidence scores',
      color: '#ec4899'
    },
    {
      icon: <FaGem />,
      title: 'Smart Recommendations',
      description: 'Google Gemini AI generates actionable improvement strategies',
      color: '#14b8a6'
    },
    {
      icon: <FaRocket />,
      title: 'Lightning Fast',
      description: 'GPU-accelerated processing for rapid analysis',
      color: '#f59e0b'
    }
  ];

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="hero-title">
              Transform Student Feedback into
              <span className="gradient-text"> Actionable Insights</span>
            </h1>
            <p className="hero-subtitle">
              Powered by cutting-edge AI and transformer models to analyze sentiment
              and provide intelligent recommendations for educational excellence
            </p>
            <div className="creator-badge">
              <span className="creator-label">Project by</span>
              <span className="creator-name">Aditya Patil</span>
            </div>
            <div className="hero-buttons">
              <Link to="/analyze" className="btn btn-primary">
                <FaRocket /> Start Analyzing
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-image"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="floating-card">
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat">
                <span className="stat-number">&lt;2s</span>
                <span className="stat-label">Processing</span>
              </div>
              <div className="stat">
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.h2
            className="section-title text-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.h2>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.h2
            className="section-title text-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="steps">
            {[
              { num: '1', title: 'Upload CSV', desc: 'Upload your feedback data in CSV format' },
              { num: '2', title: 'AI Analysis', desc: 'Our transformer model analyzes sentiment' },
              { num: '3', title: 'Get Insights', desc: 'Receive actionable recommendations' }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="step"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Feedback Analysis?</h2>
            <p>Start analyzing student feedback with AI today</p>
            <Link to="/analyze" className="btn btn-primary btn-lg">
              Get Started Now <FaRocket />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
