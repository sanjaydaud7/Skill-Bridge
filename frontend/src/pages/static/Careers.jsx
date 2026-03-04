import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const positions = [
  { dept: 'Engineering', title: 'Senior Full-Stack Engineer', type: 'Full-time · Remote', tags: ['React', 'Node.js', 'MongoDB'] },
  { dept: 'Engineering', title: 'Mobile Developer (React Native)', type: 'Full-time · Hybrid', tags: ['React Native', 'iOS', 'Android'] },
  { dept: 'Product', title: 'Product Manager – Student Experience', type: 'Full-time · Bangalore', tags: ['B2C', 'Roadmap', 'Analytics'] },
  { dept: 'Design', title: 'Senior UX Designer', type: 'Full-time · Remote', tags: ['Figma', 'User Research', 'Design Systems'] },
  { dept: 'Marketing', title: 'Content & SEO Specialist', type: 'Full-time · Remote', tags: ['SEO', 'Content Strategy', 'Growth'] },
  { dept: 'Student Success', title: 'Career Coach', type: 'Contract · Remote', tags: ['Coaching', 'Resume Review', 'Interview Prep'] },
];

const Careers = () => (
  <StaticPageLayout
    title="Careers at SkillBridge"
    subtitle="Help us build the future of career development. Remote-first, mission-driven, and growing fast."
    breadcrumb={[{ label: 'Company' }, { label: 'Careers' }]}
    heroColor="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  >
    <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
      <div className="sp-grid-card">
        <div className="card-icon">🏠</div>
        <h3>Remote First</h3>
        <p>Work from anywhere. We have team members across 15+ cities and believe great work happens everywhere.</p>
      </div>
      <div className="sp-grid-card">
        <div className="card-icon">🚀</div>
        <h3>Fast Growth</h3>
        <p>We're scaling rapidly. Your work directly impacts thousands of students finding their first opportunity.</p>
      </div>
      <div className="sp-grid-card">
        <div className="card-icon">🎓</div>
        <h3>Learning Budget</h3>
        <p>₹50,000 annual learning budget for every employee. We invest in you as much as you invest in students.</p>
      </div>
    </div>

    <div className="sp-card">
      <h2>🧑‍💼 Open Positions</h2>
      {positions.map((p, i) => (
        <div key={i} style={{ padding: '1.25rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#667eea', marginBottom: '0.3rem' }}>{p.dept}</div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem' }}>{p.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.type}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {p.tags.map((t, j) => (
                <span key={j} style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: '600' }}>{t}</span>
              ))}
            </div>
          </div>
          <button className="sp-btn sp-btn-gradient" style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}>Apply Now</button>
        </div>
      ))}
    </div>

    <div className="sp-card">
      <h2>📮 Don't See Your Role?</h2>
      <p>We're always interested in hearing from talented people. Send us your resume and a note about how you'd like to contribute.</p>
      <p style={{ marginTop: '0.75rem' }}><strong>Email:</strong> careers@skillbridge.io</p>
    </div>
  </StaticPageLayout>
);

export default Careers;
