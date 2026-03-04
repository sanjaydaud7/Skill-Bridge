import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const topics = [
  { icon: '🚀', title: 'Getting Started', desc: 'Account setup, profile completion, and finding your first internship.', link: '/faq' },
  { icon: '📋', title: 'Applications & Enrollment', desc: 'How to apply, enrollment process, requirements, and onboarding.', link: '/faq' },
  { icon: '✅', title: 'Tasks & Submissions', desc: 'Submitting tasks, revision requests, grading, and feedback.', link: '/student-guides' },
  { icon: '💳', title: 'Payments & Billing', desc: 'Certificate purchases, refund policy, and payment methods.', link: '/faq' },
  { icon: '🏆', title: 'Certificates', desc: 'How to earn, download, and verify your digital certificates.', link: '/student-guides' },
  { icon: '🔐', title: 'Account & Security', desc: 'Password reset, 2FA, privacy settings, and account deletion.', link: '/faq' },
];

const HelpCenter = () => (
  <StaticPageLayout
    title="Help Center"
    subtitle="Find answers, guides, and support for everything SkillBridge."
    breadcrumb={[{ label: 'Support' }, { label: 'Help Center' }]}
    heroColor="linear-gradient(135deg, #667eea 0%, #11998e 100%)"
  >
    <div className="sp-card" style={{ marginBottom: '2rem' }}>
      <h2>🔍 Search Help Articles</h2>
      <input
        type="text"
        placeholder="Search for help… e.g. 'how to submit a task'"
        style={{ width: '100%', padding: '0.9rem 1.2rem', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', marginTop: '0.5rem' }}
      />
    </div>

    <div className="sp-grid-2" style={{ marginBottom: '2rem' }}>
      {topics.map((t, i) => (
        <Link to={t.link} key={i} style={{ textDecoration: 'none' }}>
          <div className="sp-grid-card" style={{ cursor: 'pointer' }}>
            <div className="card-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
          </div>
        </Link>
      ))}
    </div>

    <div className="sp-card">
      <h2>📞 Still Need Help?</h2>
      <p>Our support team is available Monday–Friday, 9 AM–6 PM IST.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Link to="/contact" className="sp-btn sp-btn-gradient" style={{ padding: '0.7rem 1.6rem' }}>Contact Support</Link>
        <Link to="/community" className="sp-btn" style={{ padding: '0.7rem 1.6rem', background: '#f1f5f9', color: '#374151', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Community Forum</Link>
      </div>
    </div>
  </StaticPageLayout>
);

export default HelpCenter;
