import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const menuItems = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Internships', href: '#internships' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Certificate', href: '#certificate' },
    { name: 'Contact', href: '#contact' }
  ];

  const getProfileMenuItems = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { name: 'Admin Panel', path: '/admin/dashboard', icon: '⚙️' },
        { name: 'Profile', path: '/profile', icon: '👤' },
        { name: 'Logout', action: handleLogout, icon: '🚪' }
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Certificates', path: '/dashboard/certificates', icon: '🏆' },
        { name: 'Profile', path: '/profile', icon: '👤' },
        { name: 'Logout', action: handleLogout, icon: '🚪' }
      ];
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            SkillBridge <span className="logo-subtitle"></span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                {item.isRoute ? (
                  <Link to={item.href} className="nav-link">
                    {item.name}
                  </Link>
                ) : (
                  <a href={item.href} className="nav-link">
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons or Profile Menu */}
        <div className="navbar-cta">
          {isAuthenticated() ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="btn btn-gradient admin-panel-btn">
                  <span style={{ marginRight: '0.5rem' }}>⚙️</span>
                  Admin Panel
                </Link>
              )}
              <div className="profile-menu-container" ref={profileMenuRef}>
                <div className="profile-icon" onClick={toggleProfileMenu}>
                <img 
                  src={user?.profilePicture || 'https://via.placeholder.com/40'} 
                  alt={user?.name} 
                  className="profile-avatar"
                />
                <span className="profile-name">{user?.name}</span>
                <svg 
                  className={`profile-arrow ${isProfileMenuOpen ? 'profile-arrow-up' : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none"
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>

              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <img 
                      src={user?.profilePicture || 'https://via.placeholder.com/50'} 
                      alt={user?.name}
                      className="profile-dropdown-avatar"
                    />
                    <div className="profile-dropdown-info">
                      <h4>{user?.name}</h4>
                      <p>{user?.email}</p>
                      <span className={`role-badge role-${user?.role}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <ul className="profile-dropdown-menu">
                    {getProfileMenuItems().map((item, index) => (
                      <li key={index}>
                        {item.path ? (
                          <Link 
                            to={item.path} 
                            className="profile-dropdown-item"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <span className="profile-dropdown-icon">{item.icon}</span>
                            {item.name}
                          </Link>
                        ) : (
                          <button 
                            className="profile-dropdown-item"
                            onClick={item.action}
                          >
                            <span className="profile-dropdown-icon">{item.icon}</span>
                            {item.name}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-gradient">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav">
            {menuItems.map((item, index) => (
              <li key={index} className="mobile-nav-item">
                {item.isRoute ? (
                  <Link to={item.href} className="mobile-nav-link" onClick={closeMobileMenu}>
                    {item.name}
                  </Link>
                ) : (
                  <a href={item.href} className="mobile-nav-link" onClick={closeMobileMenu}>
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          {isAuthenticated() ? (
            <div className="mobile-profile-menu">
              <div className="mobile-profile-header">
                <img 
                  src={user?.profilePicture || 'https://via.placeholder.com/50'} 
                  alt={user?.name}
                  className="mobile-profile-avatar"
                />
                <div className="mobile-profile-info">
                  <h4>{user?.name}</h4>
                  <span className={`role-badge role-${user?.role}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <ul className="mobile-profile-links">
                {getProfileMenuItems().map((item, index) => (
                  <li key={index}>
                    {item.path ? (
                      <Link 
                        to={item.path} 
                        className="mobile-profile-link"
                        onClick={closeMobileMenu}
                      >
                        <span className="mobile-profile-icon">{item.icon}</span>
                        {item.name}
                      </Link>
                    ) : (
                      <button 
                        className="mobile-profile-link"
                        onClick={() => {
                          item.action();
                          closeMobileMenu();
                        }}
                      >
                        <span className="mobile-profile-icon">{item.icon}</span>
                        {item.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mobile-cta">
              <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="btn btn-gradient" onClick={closeMobileMenu}>Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;