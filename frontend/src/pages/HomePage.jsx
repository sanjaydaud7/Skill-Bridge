import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/NewModernApp.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HomePage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('student');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch internships from database
  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/internships`);
      if (response.data.success) {
        setInternships(response.data.data);
        setFilteredInternships(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter internships by category
  const handleFilterChange = (category) => {
    setActiveFilter(category);
    if (category === 'all') {
      setFilteredInternships(internships);
    } else {
      const filtered = internships.filter(internship => 
        internship.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredInternships(filtered);
    }
  };

  useEffect(() => {
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 6);
    }, 5000);

    return () => {
      clearInterval(testimonialInterval);
    };
  }, []);

  return (
    <div className="App">
      <Navbar />
      
      <main className="main-content">
        <section id="home" className="hero-section">
          <div className="hero-container">
            {/* Left Content - Text */}
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Learn Skills. Complete Tasks. <span className="highlight">Get Certified.</span>
                </h1>
                <p className="hero-subtitle">
                  Industry-focused internships with real projects, expert guidance, and verified certificates.
                </p>
                <div className="hero-buttons">
                  <button 
                    className="btn-hero btn-primary"
                    onClick={() => document.getElementById('internships')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <span className="btn-icon">🚀</span>
                    Explore Internships
                  </button>
                  <button className="btn-hero btn-secondary">
                    <span className="btn-icon">📄</span>
                    View Sample Certificate
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Content - Visual */}
            <div className="hero-visual">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="mockup-title">SkillBridge Dashboard</div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-chart"></div>
                  <div className="mockup-stats">
                    <div className="stat-item"></div>
                    <div className="stat-item"></div>
                    <div className="stat-item"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="floating-card card-progress">
                <div className="card-icon">📊</div>
                <div className="card-text">
                  <div className="card-title">Progress</div>
                  <div className="card-value">75%</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
              
              <div className="floating-card card-approved">
                <div className="card-icon">✅</div>
                <div className="card-text">
                  <div className="card-title">Task Approved</div>
                  <div className="card-status">Just now</div>
                </div>
              </div>
              
              <div className="floating-card card-certificate">
                <div className="card-icon">🎉</div>
                <div className="card-text">
                  <div className="card-title">Certificate Unlocked</div>
                  <div className="card-subtitle">React Development</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="internships" className="internship-explorer-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Explore Internship Programs</h2>
              <p className="section-subtitle">Choose your career path and start learning today</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All Programs
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'technology' ? 'active' : ''}`}
                onClick={() => handleFilterChange('technology')}
              >
                Technology
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'design' ? 'active' : ''}`}
                onClick={() => handleFilterChange('design')}
              >
                Design
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'marketing' ? 'active' : ''}`}
                onClick={() => handleFilterChange('marketing')}
              >
                Marketing
              </button>
              <button 
                className={`filter-tab ${activeFilter === 'data-science' ? 'active' : ''}`}
                onClick={() => handleFilterChange('data-science')}
              >
                Data Science
              </button>
            </div>
            
            {/* Internship Cards Grid */}
            <div className="internship-grid">
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#64748b' }}>Loading internships...</p>
                </div>
              ) : filteredInternships.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#64748b' }}>No internships found for this category.</p>
                </div>
              ) : (
                filteredInternships.map((internship) => {
                  // Map category to icon
                  const categoryIcons = {
                    'technology': '💻',
                    'design': '🎨',
                    'marketing': '📊',
                    'data-science': '🤖'
                  };
                  
                  return (
                    <div 
                      key={internship._id} 
                      className="internship-card"
                      data-category={internship.category}
                    >
                      <div className="card-icon">
                        <div className={`icon ${internship.category}-icon`}>
                          {categoryIcons[internship.category] || '📚'}
                        </div>
                      </div>
                      <div className="card-content">
                        <h3 className="card-title">{internship.title}</h3>
                        <div className="card-meta">
                          <span className="duration">🕒 {internship.duration} Weeks</span>
                          <span className={`level ${internship.difficulty}`}>
                            {internship.difficulty.charAt(0).toUpperCase() + internship.difficulty.slice(1)}
                          </span>
                        </div>
                        <div className="skills-section">
                          <h4>Skills you'll learn:</h4>
                          <ul className="skills-list">
                            {internship.skills?.slice(0, 3).map((skill, index) => (
                              <li key={index}>{skill}</li>
                            ))}
                          </ul>
                        </div>
                        <button 
                          className="card-btn"
                          onClick={() => navigate(`/internship/${internship._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Students Love SkillBridge</h2>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">🎥</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Structured Video Learning</h3>
                  <p className="feature-description">
                    Learn step-by-step with our comprehensive video tutorials designed by industry experts.
                  </p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">🛠</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Real-World Internship Tasks</h3>
                  <p className="feature-description">
                    Work on actual projects that companies use, giving you practical experience.
                  </p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">👨‍🏫</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Mentor Feedback</h3>
                  <p className="feature-description">
                    Get personalized guidance and feedback from experienced mentors in your field.
                  </p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">📈</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Progress Tracking</h3>
                  <p className="feature-description">
                    Monitor your learning journey with detailed analytics and milestone tracking.
                  </p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">🏆</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Verified Certificate</h3>
                  <p className="feature-description">
                    Earn industry-recognized certificates that boost your resume and career prospects.
                  </p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <span className="icon">💼</span>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Auto Portfolio Builder</h3>
                  <p className="feature-description">
                    Automatically showcase your completed projects in a professional portfolio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">Start your journey in 4 simple steps</p>
            </div>
            
            <div className="stepper-container">
              <div className="step">
                <div className="step-icon">
                  <span className="icon">📝</span>
                  <span className="step-number">1</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">Register & Enroll</h3>
                  <p className="step-description">Sign up and choose your internship program</p>
                </div>
              </div>
              
              <div className="step-connector"></div>
              
              <div className="step">
                <div className="step-icon">
                  <span className="icon">🎥</span>
                  <span className="step-number">2</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">Watch Videos</h3>
                  <p className="step-description">Learn through structured video content</p>
                </div>
              </div>
              
              <div className="step-connector"></div>
              
              <div className="step">
                <div className="step-icon">
                  <span className="icon">✅</span>
                  <span className="step-number">3</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">Complete Tasks</h3>
                  <p className="step-description">Work on real-world projects and assignments</p>
                </div>
              </div>
              
              <div className="step-connector"></div>
              
              <div className="step">
                <div className="step-icon">
                  <span className="icon">🏆</span>
                  <span className="step-number">4</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">Get Certified</h3>
                  <p className="step-description">Receive your verified certificate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform-preview" className="platform-preview-section">
          <div className="container">
            <div className="preview-content">
              {/* Left Side - Features */}
              <div className="features-content">
                <div className="section-header">
                  <h2 className="section-title">Experience Our Platform</h2>
                  <p className="section-subtitle">Everything you need to succeed in one powerful dashboard</p>
                </div>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon">📊</span>
                    </div>
                    <div className="feature-text">
                      <h3>Smart Student Dashboard</h3>
                      <p>Track your progress, assignments, and achievements in real-time with our intuitive interface.</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon">📋</span>
                    </div>
                    <div className="feature-text">
                      <h3>Task Submission System</h3>
                      <p>Submit projects seamlessly with version control and instant feedback from mentors.</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon">📈</span>
                    </div>
                    <div className="feature-text">
                      <h3>Skill Analytics</h3>
                      <p>Monitor your skill development with detailed analytics and personalized recommendations.</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon">🔓</span>
                    </div>
                    <div className="feature-text">
                      <h3>Certificate Unlock Logic</h3>
                      <p>Automatically earn certificates as you complete milestones and demonstrate mastery.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Platform Mockup */}
              <div className="platform-mockup">
                <div className="mockup-container">
                  <div className="mockup-header">
                    <div className="mockup-controls">
                      <span className="control red"></span>
                      <span className="control yellow"></span>
                      <span className="control green"></span>
                    </div>
                    <div className="mockup-title">SkillBridge Learning Platform</div>
                  </div>
                  
                  <div className="mockup-screen">
                    {/* Dashboard Content */}
                    <div className="dashboard-header">
                      <div className="user-info">
                        <div className="avatar"></div>
                        <div className="user-details">
                          <div className="username">Alex Johnson</div>
                          <div className="user-level">Full Stack Developer</div>
                        </div>
                      </div>
                      <div className="progress-circle">
                        <div className="progress-text">75%</div>
                      </div>
                    </div>
                    
                    <div className="dashboard-stats">
                      <div className="stat-card">
                        <div className="stat-number">12</div>
                        <div className="stat-label">Tasks Completed</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number">85%</div>
                        <div className="stat-label">Average Score</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number">3</div>
                        <div className="stat-label">Certificates</div>
                      </div>
                    </div>
                    
                    <div className="dashboard-chart">
                      <div className="chart-bars">
                        <div className="bar" style={{height: "60%"}}></div>
                        <div className="bar" style={{height: "80%"}}></div>
                        <div className="bar" style={{height: "45%"}}></div>
                        <div className="bar" style={{height: "90%"}}></div>
                        <div className="bar" style={{height: "75%"}}></div>
                      </div>
                    </div>
                    
                    <div className="recent-activity">
                      <div className="activity-item">
                        <div className="activity-icon">✓</div>
                        <div className="activity-text">React Component Assignment Submitted</div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">🏆</div>
                        <div className="activity-text">JavaScript Certificate Unlocked</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Highlight Tooltips */}
                <div className="tooltip tooltip-1">
                  <div className="tooltip-content">
                    <strong>Real-time Progress</strong>
                    <p>See your advancement instantly</p>
                  </div>
                  <div className="tooltip-arrow"></div>
                </div>
                
                <div className="tooltip tooltip-2">
                  <div className="tooltip-content">
                    <strong>Performance Analytics</strong>
                    <p>Track your learning metrics</p>
                  </div>
                  <div className="tooltip-arrow"></div>
                </div>
                
                <div className="tooltip tooltip-3">
                  <div className="tooltip-content">
                    <strong>Achievement System</strong>
                    <p>Unlock certificates & badges</p>
                  </div>
                  <div className="tooltip-arrow"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats-testimonials" className="stats-testimonials-section">
          <div className="container">
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-icon">🎓</div>
                <div className="stat-number">15,000+</div>
                <div className="stat-label">Students</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">📚</div>
                <div className="stat-number">60+</div>
                <div className="stat-label">Internships</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-number">4.8/5</div>
                <div className="stat-label">Rating</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">🏆</div>
                <div className="stat-number">95%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
            
            {/* Testimonials Section */}
            <div className="testimonials-section">
              <div className="section-header">
                <h2 className="section-title">Success Stories</h2>
                <p className="section-subtitle">Hear from students who transformed their careers</p>
              </div>
              
              <div className="testimonials-carousel">
                <div className="testimonial-track">
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-1"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">Sarah Mitchell</h3>
                      <p className="internship-name">Full Stack Development</p>
                      <blockquote className="success-story">
                        "SkillBridge's hands-on approach helped me land a developer role at a tech startup. The real-world projects made all the difference!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-2"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">Marcus Chen</h3>
                      <p className="internship-name">UI/UX Design</p>
                      <blockquote className="success-story">
                        "The mentor feedback was incredible. I went from beginner to designing for major brands in just 3 months!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-3"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">Emily Rodriguez</h3>
                      <p className="internship-name">Digital Marketing</p>
                      <blockquote className="success-story">
                        "The certificate opened doors I never imagined. Now I'm leading marketing campaigns for Fortune 500 companies!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-4"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">David Park</h3>
                      <p className="internship-name">Data Science & AI</p>
                      <blockquote className="success-story">
                        "The practical machine learning projects in my portfolio helped me secure a data scientist role at Google!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-5"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">Lisa Thompson</h3>
                      <p className="internship-name">Mobile App Design</p>
                      <blockquote className="success-story">
                        "From zero design experience to creating award-winning apps. SkillBridge's structured approach works!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="student-photo">
                      <div className="avatar avatar-6"></div>
                    </div>
                    <div className="testimonial-content">
                      <h3 className="student-name">Alex Kumar</h3>
                      <p className="internship-name">Growth Marketing</p>
                      <blockquote className="success-story">
                        "The analytics skills I learned helped me increase user acquisition by 300% in my first job. Amazing program!"
                      </blockquote>
                      <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="carousel-nav">
                <button className="carousel-btn prev-btn">‹</button>
                <div className="carousel-dots">
                  <span className="dot active" data-slide="0"></span>
                  <span className="dot" data-slide="1"></span>
                  <span className="dot" data-slide="2"></span>
                  <span className="dot" data-slide="3"></span>
                  <span className="dot" data-slide="4"></span>
                  <span className="dot" data-slide="5"></span>
                </div>
                <button className="carousel-btn next-btn">›</button>
              </div>
            </div>
          </div>
        </section>

        <section id="final-cta" className="final-cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Start Your Internship Journey Today</h2>
              <p className="cta-subtitle">Join thousands of students who've transformed their careers with SkillBridge</p>
              <div className="cta-buttons">
                <button className="cta-btn primary-btn">
                  <span className="btn-text">Register Now</span>
                  <span className="btn-icon">→</span>
                </button>
                <button className="cta-btn secondary-btn">
                  <span className="btn-text">Login</span>
                  <span className="btn-icon">🔑</span>
                </button>
              </div>
              <div className="trust-indicators">
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>No Credit Card Required</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>Start Learning Immediately</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="floating-element element-1">
            <div className="floating-card">
              <div className="card-icon">🏆</div>
              <div className="card-text">Get Certified</div>
            </div>
          </div>
          
          <div className="floating-element element-2">
            <div className="floating-card">
              <div className="card-icon">📈</div>
              <div className="card-text">Track Progress</div>
            </div>
          </div>
          
          <div className="floating-element element-3">
            <div className="floating-card">
              <div className="card-icon">👥</div>
              <div className="card-text">Join Community</div>
            </div>
          </div>
        </section>

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
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#team">Our Team</a></li>
                    <li><a href="#careers">Careers</a></li>
                    <li><a href="#news">News & Updates</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#investors">Investors</a></li>
                  </ul>
                </div>

                {/* Internships Column */}
                <div className="footer-column">
                  <h4 className="column-title">Internships</h4>
                  <ul className="footer-links">
                    <li><a href="#browse">Browse Internships</a></li>
                    <li><a href="#remote">Remote Opportunities</a></li>
                    <li><a href="#tech">Tech Internships</a></li>
                    <li><a href="#business">Business Internships</a></li>
                    <li><a href="#design">Design Internships</a></li>
                    <li><a href="#for-companies">For Companies</a></li>
                  </ul>
                </div>

                {/* Support Column */}
                <div className="footer-column">
                  <h4 className="column-title">Support</h4>
                  <ul className="footer-links">
                    <li><a href="#help">Help Center</a></li>
                    <li><a href="#faq">FAQ</a></li>
                    <li><a href="#guides">Student Guides</a></li>
                    <li><a href="#resources">Resources</a></li>
                    <li><a href="#community">Community Forum</a></li>
                    <li><a href="#feedback">Give Feedback</a></li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div className="footer-column">
                  <h4 className="column-title">Legal</h4>
                  <ul className="footer-links">
                    <li><a href="#privacy">Privacy Policy</a></li>
                    <li><a href="#terms">Terms of Service</a></li>
                    <li><a href="#cookies">Cookie Policy</a></li>
                    <li><a href="#security">Security</a></li>
                    <li><a href="#accessibility">Accessibility</a></li>
                    <li><a href="#compliance">GDPR Compliance</a></li>
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
      </main>
    </div>
  );
}

export default HomePage;