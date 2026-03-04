import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🌉</span>
              <span className="logo-text">SkillBridge</span>
            </div>
            <p className="footer-description">
              Connecting students with meaningful internship opportunities to bridge the gap between education and career success.
            </p>
            <div className="social-media">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <span className="social-icon">💼</span>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <span className="social-icon">🐦</span>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <span className="social-icon">📸</span>
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <span className="social-icon">👥</span>
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <span className="social-icon">📺</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-columns">
            {/* Company Column */}
            <div className="footer-column">
              <h4 className="column-title">Company</h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/team">Our Team</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/news">News &amp; Updates</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/investors">Investors</Link></li>
              </ul>
            </div>

            {/* Internships Column */}
            <div className="footer-column">
              <h4 className="column-title">Internships</h4>
              <ul className="footer-links">
                <li><Link to="/internships/browse">Browse Internships</Link></li>
                <li><Link to="/internships/remote">Remote Opportunities</Link></li>
                <li><Link to="/internships/tech">Tech Internships</Link></li>
                <li><Link to="/internships/business">Business Internships</Link></li>
                <li><Link to="/internships/design">Design Internships</Link></li>
                <li><Link to="/for-companies">For Companies</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer-column">
              <h4 className="column-title">Support</h4>
              <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/student-guides">Student Guides</Link></li>
                <li><Link to="/resources">Resources</Link></li>
                <li><Link to="/community">Community Forum</Link></li>
                <li><Link to="/feedback">Give Feedback</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="footer-column">
              <h4 className="column-title">Legal</h4>
              <ul className="footer-links">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
                <li><Link to="/security">Security</Link></li>
                <li><Link to="/accessibility">Accessibility</Link></li>
                <li><Link to="/gdpr">GDPR Compliance</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2026 SkillBridge. All rights reserved.</p>
              <p className="tagline">Building bridges to your future career.</p>
            </div>
            <div className="footer-meta">
              <span className="location">🌍 Global Platform</span>
              <span className="separator">•</span>
              <span className="status">✅ All Systems Operational</span>
              <span className="separator">•</span>
              <span className="version">v2.4.1</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
