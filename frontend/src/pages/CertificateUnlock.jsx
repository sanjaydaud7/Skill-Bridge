import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/CertificateUnlock.css';

const API_URL = 'http://localhost:5000/api';

const CertificateUnlock = () => {
  const { courseId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    initializeCertificateUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const initializeCertificateUnlock = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Get course details
      const courseRes = await axios.get(`${API_URL}/internships/${courseId}`, config);
      setCourse(courseRes.data.data);

      // Check certificate eligibility
      const eligRes = await axios.get(`${API_URL}/certificates/${courseId}/eligibility`, config);
      const { requirements: reqs } = eligRes.data;
      setRequirements(reqs);

      // Check if already has issued certificate (already paid and unlocked)
      if (eligRes.data.alreadyIssued && eligRes.data.certificate && eligRes.data.certificate.status === 'issued') {
        setCertificate(eligRes.data.certificate);
        setSuccessMessage('Your certificate has already been issued! You can download it from your certificates page.');
        return;
      }

      // If eligible, unlock the certificate (create pending-payment certificate)
      if (reqs.allRequirementsMet) {
        try {
          const unlockRes = await axios.post(
            `${API_URL}/certificates/${courseId}/unlock`,
            {},
            config
          );
          if (unlockRes.data.success) {
            setCertificate(unlockRes.data.data);
          }
        } catch (unlockErr) {
          // Certificate might already be pending or issued
          if (unlockErr.response?.data?.data) {
            const cert = unlockErr.response.data.data;
            setCertificate(cert);
            // If already issued, show success message
            if (cert.status === 'issued') {
              setSuccessMessage('Your certificate has already been issued! You can download it from your certificates page.');
            }
          } else {
            console.error('Error unlocking certificate:', unlockErr);
          }
        }
      } else {
        setError('You have not completed all requirements yet. Please complete all videos, tasks, and the final project.');
      }
    } catch (err) {
      console.error('Error initializing certificate unlock:', err);
      setError(err.response?.data?.message || 'Failed to initialize certificate unlock');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (paymentProcessing) return;
    
    try {
      setPaymentProcessing(true);
      setError(null);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post(
        `${API_URL}/payments/${courseId}/unlock-certificate`,
        { paymentMethod: 'stripe' },
        config
      );

      if (res.data.success && res.data.data.sessionId) {
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${res.data.data.sessionId}`;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleBypassPayment = async () => {
    if (paymentProcessing) return;

    if (!window.confirm('⚠️ TESTING MODE: This will unlock the certificate for free (development only).')) {
      return;
    }

    try {
      setPaymentProcessing(true);
      setError(null);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post(
        `${API_URL}/payments/${courseId}/unlock-certificate`,
        { paymentMethod: 'bypass' },
        config
      );

      if (res.data.success) {
        setCertificate(res.data.data.certificate);
        setSuccessMessage('✅ Certificate unlocked successfully! You can now download it.');
        
        // Redirect to certificates page after 2 seconds
        setTimeout(() => {
          navigate(`/dashboard/certificates?courseId=${courseId}`);
        }, 2000);
      } else {
        setError('Failed to unlock certificate');
      }
    } catch (err) {
      console.error('Bypass payment error:', err);
      setError(err.response?.data?.message || 'Failed to unlock certificate');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="certificate-unlock-container loading">
          <div className="loading-spinner"></div>
          <p>Loading certificate unlock...</p>
        </div>
      </div>
    );
  }

  if (error && !requirements?.allRequirementsMet) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="certificate-unlock-container">
          <div className="unlock-card">
            <div className="alert alert-warning">
              <h3>❌ Requirements Not Met</h3>
              <p>{error}</p>
              <button 
                onClick={() => navigate(`/dashboard/internship/${courseId}`)}
                className="btn btn-primary"
              >
                Continue Your Course
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="certificate-unlock-container">
        <button 
          onClick={() => navigate(`/dashboard/internship/${courseId}`)}
          className="back-btn"
        >
          ← Back to Course
        </button>

        <div className="unlock-card">
          {successMessage && (
            <div className="alert alert-success">
              <p>{successMessage}</p>
              <button 
                onClick={() => navigate('/dashboard/certificates')}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                View All Certificates
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}

          {!successMessage && (
            <>
              <div className="unlock-header">
                <h1>🔓 Unlock Your Certificate</h1>
                <p className="course-title">
                  {course?.title}
                </p>
              </div>

              {/* Two Column Layout: Certificate Preview + Payment */}
              <div className="unlock-content-layout">
                
                {/* Left Column: Locked Certificate Preview */}
                <div className="certificate-preview-section">
                  <div className="certificate-preview-container">
                    <div className="certificate-mock">
                      <div className="certificate-header">
                        <h2>Certificate of Completion</h2>
                      </div>
                      <div className="certificate-body">
                        <p className="cert-label">This Certificate is Proudly Presented To</p>
                        <p className="student-name">{course?.title || 'Student Name'}</p>
                        <p className="cert-text">For successfully completing the course</p>
                        <p className="course-name">{course?.title}</p>
                        <p className="cert-date">Date: {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="certificate-footer">
                        <p>SkillBridge</p>
                      </div>
                    </div>
                    <div className="locked-overlay">
                      <div className="lock-icon">🔒</div>
                      <p>Locked</p>
                      <p className="lock-subtitle">Complete payment to unlock</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Section */}
                <div className="payment-info-section">
                  {/* Requirements Checklist */}
                  <div className="requirements-section">
                    <h3>✅ Requirements Completed</h3>
                    <div className="requirements-list">
                      <div className={`requirement-item ${requirements?.videosCompleted ? 'done' : ''}`}>
                        <span className="requirement-icon">
                          {requirements?.videosCompleted ? '✓' : '○'}
                        </span>
                        <span className="requirement-text">All videos/modules watched</span>
                      </div>
                      <div className={`requirement-item ${requirements?.tasksApproved ? 'done' : ''}`}>
                        <span className="requirement-icon">
                          {requirements?.tasksApproved ? '✓' : '○'}
                        </span>
                        <span className="requirement-text">All tasks approved</span>
                      </div>
                      <div className={`requirement-item ${requirements?.projectApproved ? 'done' : ''}`}>
                        <span className="requirement-icon">
                          {requirements?.projectApproved ? '✓' : '○'}
                        </span>
                        <span className="requirement-text">Final project approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="payment-section">
                    <h3>💳 Unlock Certificate</h3>
                    <p className="payment-subtitle">
                      Complete your achievement by unlocking your certificate
                    </p>

                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="amount">{course?.certificatePrice || 499}</span>
                      <span className="period">one-time payment</span>
                    </div>

                    <div className="payment-buttons">
                      <button
                        onClick={handleStripePayment}
                        disabled={paymentProcessing}
                        className="btn btn-primary btn-full btn-stripe"
                      >
                        {paymentProcessing ? 'Processing...' : '💳 Pay with Stripe'}
                      </button>

                      {process.env.NODE_ENV === 'development' && (
                        <button
                          onClick={handleBypassPayment}
                          disabled={paymentProcessing}
                          className="btn btn-secondary btn-full btn-bypass"
                        >
                          {paymentProcessing ? 'Processing...' : '⚡ Bypass (Test Mode)'}
                        </button>
                      )}
                    </div>

                    <div className="payment-note">
                      <p>
                        Your certificate will be ready to download immediately after payment completion.
                      </p>
                    </div>
                  </div>

                  <div className="security-badge">
                    <span>🔒 Secure Payment Powered by Stripe</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CertificateUnlock;
