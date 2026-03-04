import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Investors = () => (
  <StaticPageLayout
    title="Investor Relations"
    subtitle="SkillBridge is building the world's most trusted internship and early-career platform."
    breadcrumb={[{ label: 'Company' }, { label: 'Investors' }]}
    heroColor="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #667eea 100%)"
  >
    <div className="sp-card">
      <h2>📈 Our Growth Story</h2>
      <p>Since our founding in 2022, SkillBridge has grown from a local pilot program to a platform serving students across India and Southeast Asia. We closed our Series A round of ₹45 Crore in October 2025 and are on track to expand globally in 2026.</p>
    </div>

    <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
      {[['₹45Cr', 'Series A Raised'], ['3x', 'YoY Revenue Growth'], ['15K+', 'Active Students'], ['500+', 'Partner Companies'], ['92%', 'Student Satisfaction'], ['48hrs', 'Avg. Time to Placement']].map(([val, label], i) => (
        <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#667eea' }}>{val}</div>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.3rem' }}>{label}</div>
        </div>
      ))}
    </div>

    <div className="sp-card">
      <h2>🧭 Use of Funds</h2>
      <ul>
        <li><strong>Product & Engineering (40%):</strong> AI-powered matching, mobile app, and new certification tracks</li>
        <li><strong>Geographic Expansion (25%):</strong> Entering SEA markets including Singapore, Malaysia, and Indonesia</li>
        <li><strong>Sales & Partnerships (20%):</strong> Growing our company network to 2,000+ employers</li>
        <li><strong>Operations & Support (15%):</strong> Scaling student success and platform reliability infrastructure</li>
      </ul>
    </div>

    <div className="sp-card">
      <h2>📩 Investor Inquiries</h2>
      <p>If you're interested in learning more about investment opportunities at SkillBridge, please reach out to our investor relations team.</p>
      <p style={{ marginTop: '0.75rem' }}><strong>Email:</strong> investors@skillbridge.io</p>
      <p><strong>Press Kit:</strong> Available upon request</p>
    </div>
  </StaticPageLayout>
);

export default Investors;
