import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Certificates.css';

const API_URL = 'http://localhost:5000/api';

const CertificatesView = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [coursesRes, certificatesRes] = await Promise.all([
        axios.get(`${API_URL}/courses/user/enrolled`, config),
        axios.get(`${API_URL}/certificates`, config)
      ]);

      setEnrolledCourses(coursesRes.data.data);
      setCertificates(certificatesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (courseId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${API_URL}/certificates/${courseId}/eligibility`,
        config
      );
      return response.data.data;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return null;
    }
  };

  const openPaymentModal = async (course) => {
    const eligibility = await checkEligibility(course.courseId._id);
    
    if (!eligibility || !eligibility.eligible) {
      alert(eligibility?.message || 'You are not eligible for certificate yet');
      return;
    }

    setSelectedCourse(course);
    setEligibilityData(eligibility);
    setShowPaymentModal(true);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedCourse(null);
    setEligibilityData(null);
  };

  const handleBypassPayment = async () => {
    if (!selectedCourse) return;

    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Bypass payment (testing mode)
      await axios.post(
        `${API_URL}/payments/bypass/${selectedCourse.courseId._id}`,
        {},
        config
      );

      // Generate certificate
      const certResponse = await axios.post(
        `${API_URL}/certificates/${selectedCourse.courseId._id}/generate`,
        {},
        config
      );

      alert('🎉 Certificate generated successfully!');
      closeModal();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    if (!selectedCourse) return;

    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${API_URL}/payments/create-checkout`,
        { courseId: selectedCourse.courseId._id },
        config
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(error.response?.data?.message || 'Failed to create payment session');
      setProcessing(false);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      };

      const response = await axios.get(
        `${API_URL}/certificates/${certificateId}/download`,
        config
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SkillBridge_Certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading certificates...</p>
        </div>
      </div>
    );
  }

  // Separate courses into eligible and ineligible
  const completedCourses = enrolledCourses.filter(
    course => course.progress?.completionPercentage === 100
  );
  const hasCertificate = (courseId) => {
    return certificates.some(cert => cert.courseId._id === courseId);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="certificates-container">
        <div className="certificates-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>🏆 Certificates</h1>
          <p className="subtitle">Showcase your achievements with verified certificates</p>
        </div>

        {/* Earned Certificates */}
        {certificates.length > 0 && (
          <div className="certificates-section">
            <h2>📜 Your Certificates</h2>
            <div className="certificates-grid">
              {certificates.map((cert) => (
                <div key={cert._id} className="certificate-card earned">
                  <div className="certificate-icon">🏅</div>
                  <h3>{cert.courseId.title}</h3>
                  <div className="certificate-details">
                    <p className="certificate-number">
                      Certificate No: <strong>{cert.certificateNumber}</strong>
                    </p>
                    <p className="issue-date">
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </p>
                    <p className="verification">
                      Verification Code: <code>{cert.verificationCode}</code>
                    </p>
                  </div>
                  <div className="certificate-actions">
                    <button 
                      onClick={() => downloadCertificate(cert._id)}
                      className="btn btn-primary"
                    >
                      📥 Download PDF
                    </button>
                    <button 
                      onClick={() => window.open(`${API_URL}/certificates/verify/${cert.verificationCode}`, '_blank')}
                      className="btn btn-outline"
                    >
                      🔍 Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Certificates */}
        {completedCourses.length > 0 && (
          <div className="certificates-section">
            <h2>🎯 Available Certificates</h2>
            <div className="certificates-grid">
              {completedCourses.map((course) => {
                const alreadyHasCert = hasCertificate(course.courseId._id);
                
                if (alreadyHasCert) return null;

                return (
                  <div key={course._id} className="certificate-card available">
                    <div className="certificate-icon">📄</div>
                    <h3>{course.courseId.title}</h3>
                    <div className="completion-badge">
                      ✅ Course Completed
                    </div>
                    <div className="certificate-details">
                      <p>You've successfully completed all requirements!</p>
                      <div className="price">
                        <span className="price-label">Certificate Fee:</span>
                        <span className="price-value">₹{course.courseId.certificatePrice}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openPaymentModal(course)}
                      className="btn btn-success"
                    >
                      🛒 Get Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* In Progress */}
        {enrolledCourses.filter(c => c.progress?.completionPercentage < 100).length > 0 && (
          <div className="certificates-section">
            <h2>⏳ In Progress</h2>
            <div className="certificates-grid">
              {enrolledCourses
                .filter(course => course.progress?.completionPercentage < 100)
                .map((course) => (
                  <div key={course._id} className="certificate-card in-progress">
                    <div className="certificate-icon">📚</div>
                    <h3>{course.courseId.title}</h3>
                    <div className="progress-info">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${course.progress?.completionPercentage || 0}%` }}
                        ></div>
                      </div>
                      <p>{course.progress?.completionPercentage || 0}% Complete</p>
                    </div>
                    <p className="progress-message">
                      Complete the course to unlock your certificate
                    </p>
                    <button 
                      onClick={() => navigate(`/dashboard/course/${course.courseId._id}`)}
                      className="btn btn-outline"
                    >
                      Continue Learning →
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h2>No courses enrolled yet</h2>
            <p>Enroll in courses to earn certificates</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Browse Courses
            </button>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedCourse && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🏆 Get Your Certificate</h2>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>

              <div className="payment-modal-body">
                <div className="course-summary">
                  <h3>{selectedCourse.courseId.title}</h3>
                  <div className="completion-stats">
                    <div className="stat">
                      <span className="stat-icon">✅</span>
                      <span>All videos completed</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">✅</span>
                      <span>All tasks approved</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">✅</span>
                      <span>Final project approved</span>
                    </div>
                  </div>
                </div>

                <div className="payment-amount">
                  <span className="amount-label">Certificate Fee</span>
                  <span className="amount-value">₹{selectedCourse.courseId.certificatePrice}</span>
                </div>

                <div className="payment-methods">
                  <h4>Choose Payment Method</h4>
                  
                  {/* Bypass Button for Testing */}
                  <div className="payment-option bypass-option">
                    <div className="option-header">
                      <span className="option-icon">🧪</span>
                      <div className="option-info">
                        <h5>Test Mode - Bypass Payment</h5>
                        <p>For development and testing purposes only</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleBypassPayment}
                      className="btn btn-warning btn-full"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : '⚡ Generate Certificate (Test Mode)'}
                    </button>
                  </div>

                  {/* Stripe Payment */}
                  <div className="payment-divider">
                    <span>OR</span>
                  </div>

                  <div className="payment-option stripe-option">
                    <div className="option-header">
                      <span className="option-icon">💳</span>
                      <div className="option-info">
                        <h5>Pay with Stripe</h5>
                        <p>Secure payment via credit/debit card</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleStripePayment}
                      className="btn btn-primary btn-full"
                      disabled={processing}
                    >
                      {processing ? 'Redirecting...' : '💳 Pay ₹' + selectedCourse.courseId.certificatePrice}
                    </button>
                  </div>
                </div>

                <div className="payment-note">
                  <p>🔒 Your payment is secure and encrypted</p>
                  <p>📧 Certificate will be generated instantly after payment</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesView;
