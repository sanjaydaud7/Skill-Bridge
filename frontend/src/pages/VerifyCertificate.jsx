import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/VerifyCertificate.css';

const API_URL = 'http://localhost:5000/api';

const VerifyCertificate = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('checking');

  useEffect(() => {
    verifyCertificate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      setVerificationStatus('checking');

      const res = await axios.get(`${API_URL}/certificates/verify/${code}`);

      if (res.data.success) {
        setCertificate(res.data.data);
        setVerificationStatus('valid');
      } else {
        setError(res.data.message || 'Certificate not found');
        setVerificationStatus('invalid');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify certificate';
      setError(errorMessage);
      setVerificationStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="verify-certificate-container">
          <div className="verify-card loading-state">
            <div className="loading-spinner"></div>
            <p>Verifying certificate...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="verify-certificate-container">
          <button 
            onClick={() => navigate('/')}
            className="back-btn"
          >
            ← Back to Home
          </button>

          <div className="verify-card">
            <div className="verification-header invalid">
              <div className="status-icon invalid">❌</div>
              <h1>Certificate Verification Failed</h1>
              <p className="status-message">Unable to verify this certificate</p>
            </div>

            <div className="error-section">
              <div className="error-box">
                <p className="error-text">{error}</p>
              </div>

              <div className="verification-tips">
                <h3>Troubleshooting Tips:</h3>
                <ul>
                  <li>Check if the verification code is correct</li>
                  <li>Ensure the certificate has not been revoked</li>
                  <li>Try copying and pasting the URL from your certificate email</li>
                  <li>Contact SkillBridge support if the problem persists</li>
                </ul>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (certificate) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="verify-certificate-container">
          <button 
            onClick={() => navigate('/')}
            className="back-btn"
          >
            ← Back to Home
          </button>

          <div className="verify-card">
            {/* Verification Status Header */}
            <div className="verification-header valid">
              <div className="status-icon valid">✓</div>
              <h1>Certificate Verified</h1>
              <p className="status-message">This is a valid SkillBridge certificate</p>
            </div>

            {/* Two Column Layout - Certificate Preview + Details */}
            <div className="certificate-verify-layout">
              
              {/* Left: Certificate Preview */}
              <div className="certificate-preview-panel">
                <div className="certificate-preview-mock">
                  <div className="cert-preview-header">
                    <div className="cert-logo">📜</div>
                    <h2>Certificate of Completion</h2>
                  </div>
                  
                  <div className="cert-preview-body">
                    <p className="cert-intro">This is to certify that</p>
                    <div className="cert-recipient">
                      <h3>{certificate.studentName}</h3>
                    </div>
                    <p className="cert-achievement">has successfully completed the course</p>
                    <div className="cert-course">
                      <h4>{certificate.courseName}</h4>
                    </div>
                    <div className="cert-with-grade">
                      <p>With a distinguished grade of <strong>{certificate.grade}</strong></p>
                    </div>
                  </div>
                  
                  <div className="cert-preview-footer">
                    <div className="cert-seal">🎓</div>
                    <p className="cert-official">SkillBridge | Virtual Learning Platform</p>
                  </div>
                </div>
              </div>

              {/* Right: Certificate Details */}
              <div className="certificate-details-panel">
                
                {/* Certificate Details Section */}
                <div className="certificate-details-section">
                  <h2 className="section-title">Certificate Details</h2>
                  
                  <div className="details-grid">
                    {/* Student Name */}
                    <div className="detail-item">
                      <label className="detail-label">👤 Student Name</label>
                      <div className="detail-value">{certificate.studentName}</div>
                    </div>

                    {/* Certificate Number */}
                    <div className="detail-item">
                      <label className="detail-label">🆔 Certificate Number</label>
                      <div className="detail-value certificate-number">
                        {certificate.certificateNumber}
                      </div>
                    </div>

                    {/* Course Name */}
                    <div className="detail-item full-width">
                      <label className="detail-label">📚 Course Completed</label>
                      <div className="detail-value">{certificate.courseName}</div>
                    </div>

                    {/* Issued Date */}
                    <div className="detail-item">
                      <label className="detail-label">📅 Issued Date</label>
                      <div className="detail-value">
                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="detail-item">
                      <label className="detail-label">⭐ Grade Achieved</label>
                      <div className="detail-value grade-badge">
                        {certificate.grade}
                      </div>
                    </div>

                    {/* Validity Status */}
                    <div className="detail-item full-width">
                      <label className="detail-label">✅ Verification Status</label>
                      <div className="detail-value status-valid">
                        <span className="status-indicator">●</span> Valid & Authentic
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="skills-section">
                    <h3 className="section-title">🎯 Skills Demonstrated</h3>
                    <div className="skills-grid">
                      {certificate.skills.map((skill, index) => (
                        <div key={index} className="skill-badge">
                          <span className="skill-check">✓</span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Badge */}
            <div className="verification-badge-section">
              <div className="badge-content">
                <div className="badge-icon">🔐</div>
                <div className="badge-text">
                  <h4>Authentic Certificate</h4>
                  <p>Verified and issued by SkillBridge</p>
                </div>
              </div>
            </div>

            {/* Verification Code */}
            <div className="verification-code-section">
              <label className="code-label">🔑 Verification Code</label>
              <div className="code-display">
                <code>{code}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('Verification code copied to clipboard!');
                  }}
                  className="btn-copy"
                  title="Copy verification code"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <h3>📋 About This Certificate</h3>
              <p>
                This digital certificate represents the successful completion of a professional internship program 
                offered by SkillBridge. The certificate holder has demonstrated the required competencies and 
                completed all course requirements including modules, tasks, and final project submission.
              </p>
              <p>
                Employers can verify the authenticity of this certificate using the unique verification code provided above. 
                Share this verification page with recruiters to instantly authenticate your achievement.
              </p>
            </div>

            {/* Actions */}
            <div className="verification-actions">
              <button 
                onClick={() => window.print()}
                className="btn btn-primary"
              >
                🖨️ Print Certificate
              </button>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                ← Back to SkillBridge
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="indicator">
              <span className="icon">✓</span>
              <span className="text">Verified Certificate</span>
            </div>
            <div className="indicator">
              <span className="icon">📜</span>
              <span className="text">Professional Credential</span>
            </div>
            <div className="indicator">
              <span className="icon">🔒</span>
              <span className="text">Secure & Encrypted</span>
            </div>
            <div className="indicator">
              <span className="icon">💼</span>
              <span className="text">Employer Recognized</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default VerifyCertificate;
