import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const tracks = [
  { icon: '📊', title: 'Business Analytics', desc: 'Turn raw data into actionable insights using Excel, SQL, Power BI, and Tableau.' },
  { icon: '📣', title: 'Digital Marketing', desc: 'SEO, SEM, social media, and content strategy — drive real business growth.' },
  { icon: '💼', title: 'Business Development', desc: 'Lead generation, CRM, and sales strategy for B2B and B2C companies.' },
  { icon: '💹', title: 'Finance & Accounting', desc: 'Financial modelling, budgeting, reporting, and valuation with real company data.' },
  { icon: '📦', title: 'Operations & Supply Chain', desc: 'Process optimization, logistics, and vendor management across industries.' },
  { icon: '🤝', title: 'Human Resources', desc: 'Recruitment, employee engagement, L&D, and HR systems implementation.' },
];

const BusinessInternships = () => (
  <StaticPageLayout
    title="Business Internships"
    subtitle="Build expertise in marketing, finance, operations, strategy, and business development."
    breadcrumb={[{ label: 'Internships' }, { label: 'Business Internships' }]}
    heroColor="linear-gradient(135deg, #f5a623 0%, #f64f59 100%)"
  >
    <div className="sp-card">
      <h2>🏢 Why Business Internships?</h2>
      <p>Business internships at SkillBridge go beyond PowerPoint presentations. You'll work on real challenges, analyze actual datasets, and contribute to decisions that affect real businesses. Our partners range from lean startups to established enterprises.</p>
    </div>

    <div className="sp-grid-2" style={{ marginBottom: '2rem' }}>
      {tracks.map((t, i) => (
        <div className="sp-grid-card" key={i}>
          <div className="card-icon">{t.icon}</div>
          <h3>{t.title}</h3>
          <p>{t.desc}</p>
        </div>
      ))}
    </div>

    <div className="sp-cta-block">
      <h2>Launch Your Business Career</h2>
      <p>Find the perfect business internship and start building real-world experience today.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Browse Business Internships</Link>
    </div>
  </StaticPageLayout>
);

export default BusinessInternships;
