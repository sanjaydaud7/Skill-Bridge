import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    fetchInternshipDetails();
    if (isAuthenticated) {
      checkEnrollmentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const fetchInternshipDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/internships/${id}`);
      if (response.data.success) {
        setInternship(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching internship:', err);
      setError('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/internships/user/enrolled`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const enrolled = response.data.data.some(
          enrollment => {
            // Check both _id and courseId references
            const courseIdValue = enrollment.courseId?._id || enrollment.courseId;
            return courseIdValue === id || courseIdValue?.toString() === id;
          }
        );
        setIsEnrolled(enrolled);
        if (enrolled) fetchResources(id);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const fetchResources = async (internshipId) => {
    setLoadingResources(true);
    try {
      const res = await axios.get(`${API_URL}/resources/internship/${internshipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setResources(res.data.data || []);
    } catch (err) {
      console.error('Resources fetch error:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/internship/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      const response = await axios.post(
        `${API_URL}/internships/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Successfully enrolled! Redirecting to your dashboard...');
        setIsEnrolled(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      alert(err.response?.data?.message || 'Failed to enroll in internship');
    } finally {
      setEnrolling(false);
    }
  };

  const handleGoToInternship = () => {
    navigate(`/dashboard/internship/${id}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#667eea', fontSize: '1.2rem' }}>Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Home
          </button>
          <div style={{ background: '#fee2e2', padding: '30px', borderRadius: '12px', marginTop: '20px' }}>
            <p style={{ color: '#dc2626', fontSize: '1.1rem' }}>
              {error || 'Internship not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Home
        </button>

        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {/* Thumbnail Image */}
          {internship.thumbnail && (
            <div style={{ marginBottom: '30px', borderRadius: '12px', overflow: 'hidden' }}>
              <img 
                src={internship.thumbnail} 
                alt={internship.title}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '400px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Internship+Thumbnail';
                }}
              />
            </div>
          )}
          
          {/* Header Section */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <span style={{
                padding: '6px 12px',
                background: '#e0e7ff',
                color: '#4f46e5',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {internship.category}
              </span>
              <span style={{
                padding: '6px 12px',
                background: internship.difficulty === 'beginner' ? '#dcfce7' : 
                           internship.difficulty === 'intermediate' ? '#fef3c7' : '#fee2e2',
                color: internship.difficulty === 'beginner' ? '#15803d' : 
                       internship.difficulty === 'intermediate' ? '#b45309' : '#dc2626',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {internship.difficulty.charAt(0).toUpperCase() + internship.difficulty.slice(1)}
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px' }}>
              {internship.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6' }}>
              {internship.shortDescription || internship.description}
            </p>
          </div>

          {/* Key Info Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⏱️</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {internship.duration} Weeks
              </div>
            </div>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>💰</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Certificate Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                ₹{internship.certificatePrice ? (internship.certificatePrice / 100).toFixed(0) : 'Free'}
              </div>
            </div>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>📚</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Modules</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {internship.totalModules || 0}
              </div>
            </div>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>✅</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Tasks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                {internship.totalTasks || 0}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '15px' }}>
              About This Internship
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem' }}>
              {internship.description}
            </p>
          </div>

          {/* Skills */}
          {internship.skills && internship.skills.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '15px' }}>
                Skills You'll Learn
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {internship.skills.map((skill, index) => (
                  <span 
                    key={index}
                    style={{
                      padding: '8px 16px',
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '20px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {internship.learningOutcomes && internship.learningOutcomes.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '15px' }}>
                What You'll Achieve
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {internship.learningOutcomes.map((outcome, index) => (
                  <li 
                    key={index}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {internship.prerequisites && internship.prerequisites.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '15px' }}>
                Prerequisites
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {internship.prerequisites.map((prereq, index) => (
                  <li 
                    key={index}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>•</span>
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources Section (for enrolled students) */}
          {isEnrolled && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-icons" style={{ color: '#0D1B4B', fontSize: '1.75rem' }}>folder_open</span>
                Learning Resources
              </h2>
              {loadingResources ? (
                <p style={{ color: '#94a3b8' }}>Loading resources…</p>
              ) : resources.length === 0 ? (
                <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                  <span className="material-icons" style={{ fontSize: 36, color: '#cbd5e1' }}>folder_open</span>
                  <p style={{ margin: '8px 0 0' }}>No resources uploaded yet for this internship</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {resources.map(r => {
                    const iconMap = { pdf: 'picture_as_pdf', image: 'image', document: 'description', video: 'videocam', link: 'link', other: 'attach_file' };
                    const colorMap = { pdf: '#ef4444', image: '#8b5cf6', document: '#3b82f6', video: '#f59e0b', link: '#10b981', other: '#64748b' };
                    return (
                      <div key={r._id} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="material-icons" style={{ color: colorMap[r.type], fontSize: 22 }}>{iconMap[r.type] || 'attach_file'}</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{r.title}</p>
                            {r.internshipId
                              ? <span style={{ fontSize: '0.72rem', color: '#1d4ed8' }}>For this internship</span>
                              : <span style={{ fontSize: '0.72rem', color: '#065f46' }}>Global resource</span>}
                          </div>
                        </div>
                        {r.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{r.description}</p>}
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0D1B4B', color: '#E8B84B', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginTop: 'auto', alignSelf: 'flex-start' }}
                        >
                          <span className="material-icons" style={{ fontSize: 14 }}>{r.type === 'link' ? 'open_in_new' : 'download'}</span>
                          {r.type === 'link' ? 'Open Link' : 'Download'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Enroll Button */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            {isEnrolled ? (
              <button
                onClick={handleGoToInternship}
                style={{
                  padding: '16px 48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Go to INTERNSHIP →
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  padding: '16px 48px',
                  background: enrolling 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: enrolling ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'transform 0.2s',
                  opacity: enrolling ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!enrolling) e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  if (!enrolling) e.target.style.transform = 'translateY(0)';
                }}
              >
                {enrolling ? 'Enrolling...' : (isAuthenticated ? 'Enroll Now' : 'Login to Enroll')}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InternshipDetail;
