import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const RemoteOpportunities = () => (
  <StaticPageLayout
    title="Remote Internship Opportunities"
    subtitle="Work with teams across the globe from the comfort of your home. 100% remote, 100% real experience."
    breadcrumb={[{ label: 'Internships' }, { label: 'Remote Opportunities' }]}
    heroColor="linear-gradient(135deg, #0ea5e9 0%, #38ef7d 100%)"
  >
    <div className="sp-card">
      <h2>🌍 Why Remote Internships?</h2>
      <p>Remote internships give you the flexibility to work with world-class companies without geographical limitations. You gain real skills, build your portfolio, and earn verified certificates — all from wherever you are.</p>
    </div>

    <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
      {[
        { icon: '🕐', title: 'Flexible Hours', desc: 'Many remote internships offer async workflows so you can structure your day around classes.' },
        { icon: '🌐', title: 'Global Companies', desc: 'Work with startups and enterprises from India, US, UK, Singapore, and beyond.' },
        { icon: '💻', title: 'Digital Skills', desc: 'Gain proficiency with remote collaboration tools like Slack, Notion, Figma, and GitHub.' },
        { icon: '🏆', title: 'Verified Certificate', desc: 'Every completed remote internship earns you a SkillBridge-verified digital certificate.' },
        { icon: '💰', title: 'Paid Options', desc: 'Filter for paid remote internships with stipends ranging from ₹5,000 to ₹30,000/month.' },
        { icon: '👥', title: 'Mentorship', desc: "You're never alone — every remote internship includes access to a dedicated mentor." },
      ].map((c, i) => (
        <div className="sp-grid-card" key={i}>
          <div className="card-icon">{c.icon}</div>
          <h3>{c.title}</h3>
          <p>{c.desc}</p>
        </div>
      ))}
    </div>

    <div className="sp-cta-block">
      <h2>Browse Remote Internships</h2>
      <p>Explore hundreds of verified remote opportunities across all categories.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Get Started</Link>
    </div>
  </StaticPageLayout>
);

export default RemoteOpportunities;
