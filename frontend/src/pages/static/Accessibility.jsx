import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Accessibility = () => (
  <StaticPageLayout
    title="Accessibility"
    subtitle="SkillBridge is committed to being usable and inclusive for everyone."
    breadcrumb={[{ label: 'Legal' }, { label: 'Accessibility' }]}
    heroColor="linear-gradient(135deg, #11998e 0%, #667eea 100%)"
  >
    <div className="sp-card">
      <h2>♿ Our Commitment</h2>
      <p>SkillBridge is committed to ensuring that our platform is accessible to all users, including those with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards and continuously work to improve the accessibility of our digital experiences.</p>
    </div>

    <div className="sp-grid-2" style={{ marginBottom: '2rem' }}>
      {[
        { icon: '👁️', title: 'Screen Reader Support', desc: 'Our platform is tested with NVDA, JAWS, and VoiceOver to ensure compatibility with assistive technologies.' },
        { icon: '⌨️', title: 'Keyboard Navigation', desc: 'All features are fully navigable with a keyboard. Focus states are clearly visible throughout the interface.' },
        { icon: '🔤', title: 'Readable Typography', desc: 'We use high-contrast text, adjustable font sizes, and clear typographic hierarchy.' },
        { icon: '🎨', title: 'Color Contrast', desc: 'All text meets WCAG AA contrast ratio requirements. We never rely on color alone to convey information.' },
        { icon: '📱', title: 'Responsive Design', desc: 'SkillBridge is fully usable on all screen sizes and zoom levels up to 400%.' },
        { icon: '🖼️', title: 'Alternative Text', desc: 'All meaningful images have descriptive alt text. Decorative images are marked to be skipped by screen readers.' },
      ].map((c, i) => (
        <div className="sp-grid-card" key={i}>
          <div className="card-icon">{c.icon}</div>
          <h3>{c.title}</h3>
          <p>{c.desc}</p>
        </div>
      ))}
    </div>

    <div className="sp-card">
      <h2>🔧 Known Limitations</h2>
      <p>While we aim for full accessibility, some older content and third-party embedded tools may not fully meet WCAG 2.1 AA standards. We are actively working to address these gaps. If you encounter a specific barrier, please let us know.</p>
    </div>

    <div className="sp-card">
      <h2>📩 Accessibility Feedback</h2>
      <p>If you experience any accessibility barriers while using SkillBridge or have suggestions for improvement, please contact our accessibility team. We take all reports seriously and aim to respond within 5 business days.</p>
      <p style={{ marginTop: '0.75rem' }}><strong>Email:</strong> accessibility@skillbridge.io</p>
    </div>
  </StaticPageLayout>
);

export default Accessibility;
