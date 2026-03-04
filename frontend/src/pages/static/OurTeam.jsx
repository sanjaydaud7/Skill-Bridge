import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const members = [
  { initial: 'A', name: 'Arjun Sharma', role: 'CEO & Co-Founder', bio: 'Former Google engineer with 12 years of experience in edtech and career platforms.' },
  { initial: 'P', name: 'Priya Mehta', role: 'COO & Co-Founder', bio: 'MBA from IIM Bangalore. Previously led operations at a leading HR-tech startup.' },
  { initial: 'R', name: 'Rohan Das', role: 'CTO', bio: 'Full-stack architect who has scaled platforms to 10M+ users. Open source contributor.' },
  { initial: 'N', name: 'Neha Kapoor', role: 'Head of Partnerships', bio: 'Built a network of 500+ corporate partners across tech, finance, and design industries.' },
  { initial: 'V', name: 'Vikram Patel', role: 'Head of Product', bio: 'Passionate about user-centric design. Previously at Razorpay and Flipkart.' },
  { initial: 'S', name: 'Shreya Iyer', role: 'Head of Student Success', bio: 'Career counselor turned tech leader. Has mentored over 2,000 students personally.' },
  { initial: 'M', name: 'Manish Gupta', role: 'Lead Engineer', bio: 'Backend specialist focused on building reliable, scalable microservices architectures.' },
  { initial: 'A', name: 'Ankita Joshi', role: 'Marketing Director', bio: 'Growth hacker with expertise in community building and digital marketing for B2C platforms.' },
  { initial: 'D', name: 'Dev Agarwal', role: 'Data Science Lead', bio: 'PhD in Machine Learning. Builds recommendation systems and analytics pipelines for SkillBridge.' },
];

const OurTeam = () => (
  <StaticPageLayout
    title="Meet Our Team"
    subtitle="The passionate people behind SkillBridge working to transform student careers daily."
    breadcrumb={[{ label: 'Company' }, { label: 'Our Team' }]}
    heroColor="linear-gradient(135deg, #764ba2 0%, #f64f59 100%)"
  >
    <div className="sp-card" style={{ marginBottom: '2rem' }}>
      <h2>👥 Leadership Team</h2>
      <p>We are a diverse team of educators, engineers, designers, and career coaches united by one goal: making meaningful work accessible to every student.</p>
    </div>

    <div className="sp-grid-3">
      {members.map((m, i) => (
        <div className="sp-team-card" key={i}>
          <div className="sp-team-avatar">{m.initial}</div>
          <h3>{m.name}</h3>
          <div className="role">{m.role}</div>
          <p>{m.bio}</p>
        </div>
      ))}
    </div>

    <div className="sp-cta-block" style={{ marginTop: '2rem' }}>
      <h2>Want to Join the Team?</h2>
      <p>We're always looking for talented people who share our passion for education and career development.</p>
      <a href="/careers" className="sp-btn sp-btn-white">View Open Positions</a>
    </div>
  </StaticPageLayout>
);

export default OurTeam;
