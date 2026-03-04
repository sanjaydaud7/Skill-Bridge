import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/components/StaticPage.css';

const StaticPageLayout = ({ children, breadcrumb, title, subtitle, heroColor }) => {
  return (
    <div className="static-page-wrapper">
      <Navbar />
      <div className="static-hero" style={{ background: heroColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="static-hero-content">
          {breadcrumb && (
            <div className="static-breadcrumb">
              <Link to="/">Home</Link>
              {breadcrumb.map((crumb, i) => (
                <span key={i}>
                  <span className="breadcrumb-sep"> / </span>
                  {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                </span>
              ))}
            </div>
          )}
          <h1 className="static-hero-title">{title}</h1>
          {subtitle && <p className="static-hero-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="static-page-body">
        <div className="static-page-container">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaticPageLayout;
