import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaBrain className="logo-icon" />
          <span>AI Feedback Analyzer</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/analyze"
            className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Analyze
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="navbar-toggle" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
