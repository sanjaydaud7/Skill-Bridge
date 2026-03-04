import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const threads = [
  { tag: 'General', title: 'Introduce yourself — where are you in your career journey?', replies: 142, views: '2.1k', time: '2h ago' },
  { tag: 'Tech', title: 'Tips for completing the React internship final project?', replies: 38, views: '614', time: '4h ago' },
  { tag: 'Career', title: 'How long did it take to get your first interview after SkillBridge?', replies: 67, views: '1.4k', time: '6h ago' },
  { tag: 'Design', title: 'Best resources for improving Figma skills alongside the design track?', replies: 24, views: '389', time: '1d ago' },
  { tag: 'Help', title: 'Task submission is stuck — anyone else seeing this issue?', replies: 12, views: '204', time: '1d ago' },
  { tag: 'General', title: 'Got a full-time offer after my SkillBridge internship 🎉', replies: 93, views: '3.2k', time: '2d ago' },
];

const tagColors = { General: '#667eea', Tech: '#11998e', Career: '#f5a623', Design: '#c471ed', Help: '#f64f59' };

const CommunityForum = () => (
  <StaticPageLayout
    title="Community Forum"
    subtitle="Connect with fellow students, share experiences, ask questions, and celebrate wins together."
    breadcrumb={[{ label: 'Support' }, { label: 'Community Forum' }]}
    heroColor="linear-gradient(135deg, #764ba2 0%, #11998e 100%)"
  >
    <div className="sp-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <h2 style={{ marginBottom: '0.4rem' }}>💬 Recent Discussions</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 0 }}>Join the conversation — ask questions, share advice, and support each other.</p>
      </div>
      <Link to="/register" className="sp-btn sp-btn-gradient" style={{ padding: '0.75rem 1.5rem' }}>Join & Post</Link>
    </div>

    {threads.map((t, i) => (
      <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
        <div style={{ flex: 1 }}>
          <span style={{ background: tagColors[t.tag] || '#667eea', color: 'white', borderRadius: '20px', padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.5rem', display: 'inline-block' }}>{t.tag}</span>
          <div style={{ fontSize: '0.975rem', fontWeight: '600', color: '#1e293b', marginTop: '0.4rem' }}>{t.title}</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
          <span>💬 {t.replies}</span>
          <span>👁 {t.views}</span>
          <span>{t.time}</span>
        </div>
      </div>
    ))}

    <div className="sp-cta-block" style={{ marginTop: '1.5rem' }}>
      <h2>Be Part of the Community</h2>
      <p>Over 12,000 students already sharing, learning, and growing together.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Join SkillBridge Free</Link>
    </div>
  </StaticPageLayout>
);

export default CommunityForum;
