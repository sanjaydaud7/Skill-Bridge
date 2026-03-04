import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const resources = [
  { category: 'Career Development', items: [
    { icon: '📄', title: 'Resume Writing Guide', desc: 'A complete template and checklist for writing a resume that gets noticed by tech and business recruiters.' },
    { icon: '🎤', title: 'Interview Preparation Handbook', desc: 'Common interview questions, STAR method examples, and tips for video interviews.' },
    { icon: '💼', title: 'LinkedIn Profile Optimization', desc: 'How to build a LinkedIn profile that attracts recruiters and showcases your internship work.' },
  ]},
  { category: 'Learning Resources', items: [
    { icon: '🎓', title: 'Free Online Courses Directory', desc: 'Curated list of free courses on Coursera, edX, and YouTube mapped to each internship track.' },
    { icon: '📚', title: 'Recommended Reading List', desc: 'Books, newsletters, and podcasts recommended by SkillBridge mentors and industry professionals.' },
    { icon: '🛠️', title: 'Tool & Software Guides', desc: 'Beginner guides for Figma, Git, VS Code, Notion, and other tools used across internship tracks.' },
  ]},
  { category: 'Templates & Downloads', items: [
    { icon: '📊', title: 'Project Report Template', desc: 'A structured template for documenting your internship project for your portfolio.' },
    { icon: '✉️', title: 'Professional Email Templates', desc: 'Email templates for reaching out to mentors, following up on applications, and requesting referrals.' },
    { icon: '🗂️', title: 'Portfolio Case Study Template', desc: 'Figma and Google Docs templates for creating compelling design and development case studies.' },
  ]},
];

const Resources = () => (
  <StaticPageLayout
    title="Resources"
    subtitle="Free tools, templates, guides, and curated content to accelerate your career."
    breadcrumb={[{ label: 'Support' }, { label: 'Resources' }]}
    heroColor="linear-gradient(135deg, #0ea5e9 0%, #764ba2 100%)"
  >
    {resources.map((section, si) => (
      <div key={si}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#667eea', marginBottom: '0.75rem', marginTop: si > 0 ? '0.5rem' : 0 }}>{section.category}</div>
        <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
          {section.items.map((item, i) => (
            <div className="sp-grid-card" key={i} style={{ cursor: 'pointer' }}>
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#667eea', fontWeight: '600' }}>Access Resource →</div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </StaticPageLayout>
);

export default Resources;
