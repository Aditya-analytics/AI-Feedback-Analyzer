import React from 'react';
import { motion } from 'framer-motion';
import { FaPython, FaReact, FaRobot, FaServer } from 'react-icons/fa';
import { SiPytorch, SiFastapi, SiGooglegemini } from 'react-icons/si';
import './About.css';

const About = () => {
  const techStack = [
    { name: 'FastAPI', icon: <SiFastapi />, desc: 'High-performance Python API framework', color: '#009688' },
    { name: 'React', icon: <FaReact />, desc: 'Modern frontend library', color: '#61dafb' },
    { name: 'PyTorch', icon: <SiPytorch />, desc: 'Machine learning framework', color: '#ee4c2c' },
    { name: 'Transformers', icon: <FaRobot />, desc: 'RoBERTa sentiment model', color: '#ff6f00' },
    { name: 'Gemini AI', icon: <SiGooglegemini />, desc: 'Google AI for recommendations', color: '#4285f4' },
    { name: 'Python', icon: <FaPython />, desc: 'Backend programming language', color: '#3776ab' }
  ];

  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="about-container">
        <motion.div
          className="page-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="gradient-text">About This Project</h1>
          <p>AI-powered feedback analysis built with cutting-edge technology</p>
        </motion.div>

        <motion.section
          className="about-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="card">
            <h2>🎯 Our Mission</h2>
            <p>
              We aim to revolutionize how educational institutions understand and act on student feedback.
              By leveraging state-of-the-art AI and natural language processing, we transform raw feedback
              into actionable insights that drive meaningful improvements.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="section-title text-center">Technology Stack</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                className="tech-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="tech-icon" style={{ color: tech.color }}>
                  {tech.icon}
                </div>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="card">
            <h2>🚀 How It Works</h2>
            <div className="how-list">
              <div className="how-item">
                <span className="how-number">1</span>
                <div>
                  <h3>Data Upload</h3>
                  <p>Upload your CSV file containing student feedback reviews</p>
                </div>
              </div>
              <div className="how-item">
                <span className="how-number">2</span>
                <div>
                  <h3>Sentiment Analysis</h3>
                  <p>RoBERTa transformer model analyzes each review and assigns sentiment labels with confidence scores</p>
                </div>
              </div>
              <div className="how-item">
                <span className="how-number">3</span>
                <div>
                  <h3>AI Recommendations</h3>
                  <p>Google Gemini AI processes negative feedback to generate prioritized, actionable recommendations</p>
                </div>
              </div>
              <div className="how-item">
                <span className="how-number">4</span>
                <div>
                  <h3>Take Action</h3>
                  <p>Implement suggested improvements and track progress over time</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="card highlight-card">
            <h2>💡 Key Features</h2>
            <ul className="feature-list">
              <li>✅ 95%+ accuracy in sentiment detection</li>
              <li>✅ Real-time processing with GPU acceleration</li>
              <li>✅ Batch analysis for large datasets</li>
              <li>✅ Contextual AI recommendations</li>
              <li>✅ Export results and insights</li>
              <li>✅ Mobile-responsive interface</li>
            </ul>
          </div>
        </motion.section>

        <motion.section
          className="about-section cta-section"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="cta-card">
            <h2>Ready to Get Started?</h2>
            <p>Transform your student feedback into actionable insights today</p>
            <a href="/analyze" className="btn btn-primary btn-lg">
              Start Analyzing <FaRobot />
            </a>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default About;
