import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const tracks = [
  { icon: '⚛️', title: 'Frontend Development', desc: 'React, Vue, Angular — build beautiful, performant user interfaces for real products.' },
  { icon: '⚙️', title: 'Backend Development', desc: 'Node.js, Python, Java — architect APIs and services that power modern applications.' },
  { icon: '🤖', title: 'Machine Learning & AI', desc: 'Tensorflow, PyTorch — work on computer vision, NLP, and data-driven projects.' },
  { icon: '☁️', title: 'Cloud & DevOps', desc: 'AWS, Docker, Kubernetes — deploy and scale modern cloud-native infrastructure.' },
  { icon: '🔐', title: 'Cybersecurity', desc: 'Pen testing, threat analysis, and building security systems that protect real users.' },
  { icon: '📱', title: 'Mobile Development', desc: 'React Native and Flutter — ship iOS and Android apps used by real customers.' },
];

const TechInternships = () => (
  <StaticPageLayout
    title="Tech Internships"
    subtitle="Land a role in software engineering, data science, cloud, DevOps, cybersecurity, and more."
    breadcrumb={[{ label: 'Internships' }, { label: 'Tech Internships' }]}
    heroColor="linear-gradient(135deg, #1a1a2e 0%, #667eea 100%)"
  >
    <div className="sp-card">
      <h2>💻 Why Tech Internships at SkillBridge?</h2>
      <p>Our tech internship tracks are designed with input from industry engineers and hiring managers. Every project is real, every task is evaluated, and every certificate is verified — so you have tangible proof of your skills when applying for full-time roles.</p>
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
      <h2>📋 What to Expect</h2>
      <ul>
        <li>Structured 4–12 week programs with clear weekly milestones</li>
        <li>Real codebase contributions and GitHub portfolio projects</li>
        <li>Weekly code reviews from senior engineers</li>
        <li>Access to a private Discord community of tech interns</li>
        <li>Certificate upon successful project completion</li>
      </ul>
    </div>

    <div className="sp-cta-block">
      <h2>Start Your Tech Career</h2>
      <p>Register and browse tech internships matched to your skill level.</p>
      <Link to="/register" className="sp-btn sp-btn-white">Explore Tech Internships</Link>
    </div>
  </StaticPageLayout>
);

export default TechInternships;
