import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const tracks = [
  { icon: '🎨', title: 'UI/UX Design', desc: 'User research, wireframing, prototyping, and design systems with Figma.' },
  { icon: '🖼️', title: 'Graphic Design', desc: 'Brand identity, print & digital design using Adobe Illustrator and Photoshop.' },
  { icon: '🎬', title: 'Motion Design', desc: 'After Effects and Lottie animations for apps, websites, and social content.' },
  { icon: '📸', title: 'Visual Content & Photography', desc: 'Product photography, editing, and visual storytelling for real brands.' },
  { icon: '🌐', title: 'Web Design', desc: 'Design pixel-perfect websites using Webflow, Figma, and modern CSS.' },
  { icon: '📱', title: 'Mobile & App Design', desc: 'Design beautiful iOS and Android experiences that users love.' },
];

const DesignInternships = () => (
  <StaticPageLayout
    title="Design Internships"
    subtitle="Build a stunning portfolio while working on real design projects with leading companies."
    breadcrumb={[{ label: 'Internships' }, { label: 'Design Internships' }]}
    heroColor="linear-gradient(135deg, #c471ed 0%, #f64f59 100%)"
  >
    <div className="sp-card">
      <h2>🎨 Design That Matters</h2>
      <p>SkillBridge design internships aren't busywork. You'll solve real design problems for real companies, building a portfolio that speaks louder than any degree. Every project is mentored by a senior designer and every design is shipped.</p>
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

    <div className="sp-card">
      <h2>🖼️ Portfolio Projects</h2>
      <p>By the end of your SkillBridge design internship, you'll have:</p>
      <ul>
        <li>2–4 portfolio-ready case studies with real project context</li>
        <li>Figma/Adobe files you can showcase to future employers</li>
        <li>A verified certificate demonstrating your design abilities</li>
        <li>A mentor recommendation letter upon request</li>
      </ul>
    </div>

    <div className="sp-cta-block">
      <h2>Start Building Your Design Portfolio</h2>
      <p>Join hundreds of design students already working on real-world projects.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Explore Design Internships</Link>
    </div>
  </StaticPageLayout>
);

export default DesignInternships;
