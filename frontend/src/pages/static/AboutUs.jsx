import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const AboutUs = () => (
  <StaticPageLayout
    title="About SkillBridge"
    subtitle="Connecting ambitious students with world-class internship opportunities since 2022."
    breadcrumb={[{ label: 'Company' }, { label: 'About Us' }]}
    heroColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  >
    <div className="sp-grid-2" style={{ marginBottom: '2rem' }}>
      <div className="sp-grid-card">
        <div className="card-icon">🎯</div>
        <h3>Our Mission</h3>
        <p>Bridge the gap between academic learning and professional experience by connecting students with meaningful internship opportunities globally.</p>
      </div>
      <div className="sp-grid-card">
        <div className="card-icon">🔭</div>
        <h3>Our Vision</h3>
        <p>A world where every student has access to the internship and career opportunities they deserve, regardless of background or location.</p>
      </div>
    </div>

    <div className="sp-card">
      <h2>🌉 Our Story</h2>
      <p>SkillBridge was born out of a simple observation: too many talented students were graduating without the practical experience employers needed. Founded in 2022, we set out to change that.</p>
      <p>What started as a small platform connecting local businesses with university students has grown into a global ecosystem serving thousands of students and hundreds of companies worldwide. We've helped facilitate over 15,000 internship placements and issued more than 8,000 verified certificates.</p>
      <p>Today, SkillBridge is more than just a job board — it's a full career development platform with structured learning paths, task-based assessments, mentorship programs, and industry-recognized certifications.</p>
    </div>

    <div className="sp-card">
      <h2>📊 By the Numbers</h2>
      <div className="sp-grid-3">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#667eea' }}>15K+</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Internship Placements</div>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#667eea' }}>500+</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Partner Companies</div>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#667eea' }}>8K+</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Certificates Issued</div>
        </div>
      </div>
    </div>

    <div className="sp-card">
      <h2>💡 Our Values</h2>
      <ul>
        <li><strong>Accessibility:</strong> We believe great opportunities should be available to everyone, not just those with connections.</li>
        <li><strong>Authenticity:</strong> Every internship on our platform is verified and every certificate represents real demonstrated skills.</li>
        <li><strong>Growth:</strong> We're committed to continuous improvement for our students, partners, and the platform itself.</li>
        <li><strong>Community:</strong> Success is collective. We foster a supportive network of students, mentors, and employers.</li>
        <li><strong>Trust:</strong> Transparency and integrity guide every decision we make.</li>
      </ul>
    </div>

    <div className="sp-cta-block">
      <h2>Ready to Bridge Your Future?</h2>
      <p>Join thousands of students already building their careers with SkillBridge.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Get Started Free</Link>
    </div>
  </StaticPageLayout>
);

export default AboutUs;
