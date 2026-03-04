import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const news = [
  { date: 'Feb 15, 2026', tag: 'Product Update', title: 'SkillBridge Launches AI-Powered Career Matching', desc: 'Our new ML-based matching algorithm connects students with internships that fit their skills, interests, and availability with 3x better accuracy.' },
  { date: 'Jan 28, 2026', tag: 'Partnership', title: 'SkillBridge Partners with 50 New Tech Companies', desc: 'We have expanded our company network to include 50 new tech employers, opening over 200 new internship positions in software development, data science, and cybersecurity.' },
  { date: 'Jan 10, 2026', tag: 'Milestone', title: '10,000 Certificates Milestone Reached', desc: 'SkillBridge celebrates issuing its 10,000th verified certificate. Each representing a student who completed a real internship and earned industry recognition.' },
  { date: 'Dec 5, 2025', tag: 'Feature', title: 'Introducing Live Mentor Sessions', desc: 'Students can now book 1-on-1 video sessions with industry mentors directly through the SkillBridge dashboard.' },
  { date: 'Nov 18, 2025', tag: 'Award', title: 'SkillBridge Named Top EdTech Startup 2025', desc: 'Education Week recognized SkillBridge as one of the top 10 most impactful edtech companies in India for 2025.' },
  { date: 'Oct 3, 2025', tag: 'Funding', title: 'Series A Funding Round Closed at ₹45 Crore', desc: 'Backed by leading edtech investors, SkillBridge secures Series A funding to accelerate product development and geographic expansion.' },
];

const tagColors = { 'Product Update': '#667eea', Partnership: '#11998e', Milestone: '#f64f59', Feature: '#f5a623', Award: '#764ba2', Funding: '#0ea5e9' };

const NewsUpdates = () => (
  <StaticPageLayout
    title="News & Updates"
    subtitle="The latest from SkillBridge — product launches, milestones, and company announcements."
    breadcrumb={[{ label: 'Company' }, { label: 'News & Updates' }]}
    heroColor="linear-gradient(135deg, #f64f59 0%, #c471ed 100%)"
  >
    {news.map((n, i) => (
      <div className="sp-card" key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ minWidth: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>{n.date.split(' ').slice(0, 2).join(' ')}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{n.date.split(' ')[2]}</div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ background: tagColors[n.tag] || '#667eea', color: 'white', borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>{n.tag}</span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0.6rem 0 0.4rem' }}>{n.title}</h3>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>{n.desc}</p>
        </div>
      </div>
    ))}
  </StaticPageLayout>
);

export default NewsUpdates;
