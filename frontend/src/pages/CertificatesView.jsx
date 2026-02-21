  // Helper for beautiful certificate card
  const renderCertificateCard = cert => (
    <div
      key={cert._id}
      className="certificate-card earned"
      style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #e0eafc 0%, #f0fff4 100%)', border: '2px solid #28a745', boxShadow: '0 8px 24px rgba(40,167,69,0.08)' }}
      onClick={() => downloadCertificate(cert._id)}
    >
      <div className="certificate-icon" style={{ fontSize: 72, marginBottom: 12 }}>🏅</div>
      <div className="completion-badge">Payment Successful</div>
      <h3 style={{ fontWeight: 700, color: '#222', marginBottom: 8 }}>{cert.courseId.title}</h3>
      <div className="certificate-details">
        <p className="certificate-number">
          <span style={{ color: '#333' }}>Certificate No:</span> <strong>{cert.certificateNumber}</strong>
        </p>
        <p className="issue-date">
          <span style={{ color: '#333' }}>Issued:</span> {new Date(cert.issuedAt).toLocaleDateString()}
        </p>
        <p className="verification">
          <span style={{ color: '#333' }}>Verification Code:</span> <code>{cert.verificationCode}</code>
        </p>
      </div>
      <div className="certificate-actions" style={{ marginTop: 16 }}>
        <button 
          onClick={e => { e.stopPropagation(); downloadCertificate(cert._id); }}
          className="btn btn-primary"
          style={{ marginRight: 8 }}
        >
          📥 Download PDF
        </button>
        <button 
          onClick={e => { e.stopPropagation(); window.open(`${API_URL}/certificates/verify/${cert.verificationCode}`, '_blank'); }}
          className="btn btn-outline"
        >
          🔍 Verify
        </button>
      </div>
    </div>
  );
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import '../styles/Certificates.css';

const API_URL = 'http://localhost:5000/api';

const CertificatesView = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const certificateSectionRef = useRef({});
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);

  const [processing, setProcessing] = useState(false);


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

  // Get courseId from URL parameter
  const courseIdFromUrl = searchParams.get('courseId');

  // Handle auto-scroll and highlight when courseId is passed via URL
  useEffect(() => {
    const courseIdFromUrl = searchParams.get('courseId');
    const paymentSuccess = searchParams.get('success');
    const paymentCanceled = searchParams.get('canceled');
    
    // Show success message for Stripe payment
    if (paymentSuccess === 'true') {
      // Wait a bit for webhook to process, then refresh and show success
      setTimeout(() => {
        fetchData().then(() => {
          alert('🎉 Payment successful! Your certificate has been unlocked automatically.');
          // Scroll to top to show certificate
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Remove success param from URL
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('success');
          newParams.delete('session_id');
          navigate(`/dashboard/certificates${newParams.toString() ? '?' + newParams.toString() : ''}`, { replace: true });
        });
      }, 1000); // 1 second delay to allow webhook processing
      return;
    }
    
    // Show canceled message
    if (paymentCanceled === 'true') {
      alert('❌ Payment was canceled. You can try again anytime.');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('canceled');
      navigate(`/dashboard/certificates${newParams.toString() ? '?' + newParams.toString() : ''}`, { replace: true });
      return;
    }
    
    if (courseIdFromUrl && enrolledCourses.length > 0) {
      // Find the course
      const targetCourse = enrolledCourses.find(
        course => course.courseId._id === courseIdFromUrl
      );

      if (targetCourse) {
        // Highlight the course
        setHighlightedCourseId(courseIdFromUrl);

        // Scroll to the certificate section after a brief delay
        setTimeout(() => {
          const element = certificateSectionRef.current[courseIdFromUrl];
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 500);

        // Remove highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCourseId(null);
        }, 3500);
      }
    }
  }, [searchParams, enrolledCourses, navigate]);

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



  const handleBypassPayment = async (course) => {
    if (!course) {
      alert('Please select a course first');
      return;
    }

    if (!window.confirm('🧪 TEST MODE: Generate certificate for free?')) {
      return;
    }

    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log('Bypassing payment for course:', course.courseId._id);
      
      // Bypass payment (certificate is auto-generated)
      const response = await axios.post(
        `${API_URL}/payments/bypass/${course.courseId._id}`,
        {},
        config
      );

      console.log('Payment and certificate response:', response.data);

      // Refresh data to show certificate
      await fetchData();

      // Check if certificate was generated
      if (response.data.data?.certificate) {
        alert('🎉 Payment completed and certificate unlocked successfully!\n\nYour certificate is now available. Scroll up to view and download it.');
        
        // Scroll to top to show the certificate
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('✅ Payment completed successfully!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      console.error('Error response:', error.response?.data);
      
      // Check if certificate already issued
      if (error.response?.data?.alreadyIssued) {
        alert('✅ Certificate already issued! Refreshing...');
        await fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorMsg = error.response?.data?.message || error.message;
        alert(`❌ Error: ${errorMsg}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async (course) => {
    if (!course) {
      alert('Please select a course first');
      return;
    }

    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${API_URL}/payments/create-checkout`,
        { courseId: course.courseId._id },
        config
      );

      // Check if certificate was auto-generated (payment already existed)
      if (response.data.data?.certificate) {
        await fetchData(); // Refresh to show certificate
        alert('🎉 Certificate already unlocked from your previous payment!\n\nScroll up to view and download your certificate.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setProcessing(false);
      } else if (response.data.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.url;
      } else {
        await fetchData();
        alert('✅ Payment processed successfully!');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorData = error.response?.data;
      
      // Check if certificate already exists
      if (errorData?.certificateExists) {
        alert('✅ Certificate already issued for this course! Refreshing...');
        await fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(errorData?.message || 'Failed to create payment session');
      }
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
  let completedCourses = enrolledCourses.filter(
    course => course.progress?.completionPercentage === 100
  );
  
  // Filter by courseId if provided in URL
  if (courseIdFromUrl) {
    completedCourses = completedCourses.filter(
      course => course.courseId._id === courseIdFromUrl
    );
  }
  
  const hasCertificate = (courseId) => {
    return certificates.some(cert => cert.courseId._id === courseId);
  };
  
  // Filter certificates by courseId if provided
    // Only show certificates with successful payment
    let displayCertificates = certificates.filter(cert => cert.paymentId && cert.paymentId.status === 'completed');
  let inProgressCourses = enrolledCourses.filter(c => c.progress?.completionPercentage < 100);
  
  if (courseIdFromUrl) {
    displayCertificates = certificates.filter(
      cert => cert.courseId._id === courseIdFromUrl
    );
    inProgressCourses = inProgressCourses.filter(
      course => course.courseId._id === courseIdFromUrl
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="certificates-container">
        <div className="certificates-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>🏆 Certificates</h1>
          <p className="subtitle">
            {courseIdFromUrl 
              ? 'Certificate for your completed course' 
              : 'Showcase your achievements with verified certificates'
            }
          </p>
          {courseIdFromUrl && (
            <button 
              onClick={() => navigate('/dashboard/certificates')} 
              className="btn btn-outline"
              style={{ marginTop: '10px' }}
            >
              📜 View All Certificates
            </button>
          )}
        </div>

        {/* Earned Certificates */}
        {displayCertificates.length > 0 && (
          <div className="certificates-section">
            <h2>📜 Your Certificates</h2>
            {courseIdFromUrl && displayCertificates.length > 0 && (
              <div className="success-banner" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0' }}>🎉 Congratulations!</h3>
                <p style={{ margin: 0 }}>Your certificate is ready! Download it below.</p>
              </div>
            )}
            <div className="certificates-grid">
              {displayCertificates.map(renderCertificateCard)}
            </div>
          </div>
        )}

        {/* Available Certificates */}
        {completedCourses.length > 0 && (
          <div className="certificates-section">
            <h2>🎯 Available Certificates</h2>
            
            {completedCourses.map((course) => {
              const alreadyHasCert = hasCertificate(course.courseId._id);
              
              if (alreadyHasCert) return null;

              return (
                <div 
                  key={course._id} 
                  className={`certificate-unlock-section ${highlightedCourseId === course.courseId._id ? 'highlighted' : ''}`}
                  ref={(el) => certificateSectionRef.current[course.courseId._id] = el}
                >
                  {/* Left: Certificate Preview */}
                  <div className="certificate-preview">
                    <div className="certificate-frame locked">
                      <div className="certificate-header-design">
                        <div className="certificate-logo">🎓</div>
                        <h3>SkillBridge</h3>
                        <p className="certificate-subtitle">Certificate of Completion</p>
                      </div>
                      
                      <div className="certificate-body">
                        <p className="certificate-text">This is to certify that</p>
                        <h2 className="student-name">[Your Name]</h2>
                        <p className="certificate-text">has successfully completed</p>
                        <h3 className="course-name">{course.courseId.title}</h3>
                        
                        <div className="certificate-details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{course.courseId.duration} weeks</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{course.courseId.category}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Grade:</span>
                            <span className="detail-value">A</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="certificate-footer">
                        <div className="signature-line">
                          <div className="signature">
                            <div className="signature-img">✍️</div>
                            <p>Authorized Signature</p>
                          </div>
                        </div>
                        <div className="certificate-seal">
                          <div className="seal">🏆</div>
                          <p>Official Seal</p>
                        </div>
                      </div>
                      
                      {/* Lock Overlay */}
                      <div className="certificate-lock-overlay">
                        <div className="lock-icon">🔒</div>
                        <p className="lock-message">Complete Payment to Unlock</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Options */}
                  <div className="payment-options-panel">
                    <div className="completion-status">
                      <h3>✅ All Requirements Completed!</h3>
                      <div className="completion-checklist">
                        <div className="check-item">
                          <span className="check-icon">✓</span>
                          <span>All videos watched</span>
                        </div>
                        <div className="check-item">
                          <span className="check-icon">✓</span>
                          <span>All tasks approved</span>
                        </div>
                        <div className="check-item">
                          <span className="check-icon">✓</span>
                          <span>Final project approved</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-section">
                      <div className="price-display">
                        <span className="price-label">Certificate Fee</span>
                        <span className="price-amount">₹{course.courseId.certificatePrice}</span>
                      </div>

                      <div className="payment-methods-list">
                        {/* Test Mode Bypass */}
                        <div className="payment-method-card bypass-card">
                          <div className="method-header">
                            <span className="method-icon">🧪</span>
                            <div>
                              <h4>Test Mode</h4>
                              <p>Bypass payment for testing</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleBypassPayment(course)}
                            className="btn-bypass"
                            disabled={processing}
                          >
                            {processing ? '⏳ Processing...' : '⚡ Generate Certificate (Free Test)'}
                          </button>
                        </div>

                        {/* Stripe Payment */}
                        <div className="divider-text">OR PAY OFFICIALLY</div>
                        
                        <div className="payment-method-card stripe-card">
                          <div className="method-header">
                            <span className="method-icon">💳</span>
                            <div>
                              <h4>Stripe Payment</h4>
                              <p>Secure payment gateway</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleStripePayment(course)}
                            className="btn-stripe"
                            disabled={processing}
                          >
                            {processing ? '⏳ Processing...' : `💳 Pay ₹${course.courseId.certificatePrice}`}
                          </button>
                        </div>
                      </div>

                      <div className="payment-security-note">
                        <p>🔒 Secure & encrypted payment</p>
                        <p>📧 Instant certificate delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}



        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <div className="certificates-section">
            <h2>⏳ In Progress</h2>
            <div className="certificates-grid">
              {inProgressCourses.map((course) => (
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
        {!courseIdFromUrl && enrolledCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h2>No courses enrolled yet</h2>
            <p>Enroll in courses to earn certificates</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Browse Courses
            </button>
          </div>
        )}

        {/* No certificate for specific course */}
        {courseIdFromUrl && displayCertificates.length === 0 && completedCourses.length === 0 && inProgressCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>Course not found or not completed</h2>
            <p>Complete the course requirements to earn your certificate</p>
            <button onClick={() => navigate('/dashboard/certificates')} className="btn btn-primary">
              View All Certificates
            </button>
          </div>
        )}


      </div>
    </div>
  );
};

export default CertificatesView;
