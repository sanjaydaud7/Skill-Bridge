import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const SecurityPage = () => (
  <StaticPageLayout
    title="Security"
    subtitle="How SkillBridge protects your data and keeps your account safe."
    breadcrumb={[{ label: 'Legal' }, { label: 'Security' }]}
    heroColor="linear-gradient(135deg, #0f3460 0%, #667eea 100%)"
  >
    <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
      {[
        { icon: '🔒', title: 'TLS Encryption', desc: 'All data between your browser and SkillBridge is encrypted using TLS 1.3.' },
        { icon: '🗄️', title: 'Encrypted Storage', desc: 'Sensitive data at rest is protected with AES-256 encryption.' },
        { icon: '🛡️', title: 'DDoS Protection', desc: 'Our infrastructure uses enterprise-grade DDoS mitigation to stay online.' },
        { icon: '🔑', title: 'Two-Factor Auth', desc: 'Enable 2FA from your account settings for an extra layer of login security.' },
        { icon: '🕵️', title: 'Security Audits', desc: 'We conduct regular penetration tests and third-party security reviews.' },
        { icon: '🚨', title: 'Incident Response', desc: 'Our team responds to security incidents within 1 hour and notifies users within 72 hours.' },
      ].map((c, i) => (
        <div className="sp-grid-card" key={i}>
          <div className="card-icon">{c.icon}</div>
          <h3>{c.title}</h3>
          <p>{c.desc}</p>
        </div>
      ))}
    </div>

    <div className="sp-card">
      <h2>🐛 Responsible Disclosure</h2>
      <p>We take security vulnerabilities seriously. If you've discovered a potential security issue in SkillBridge, please report it responsibly before public disclosure. We commit to acknowledging reports within 48 hours and providing regular updates as we investigate.</p>
      <p style={{ marginTop: '0.75rem' }}><strong>Report to:</strong> security@skillbridge.io</p>
      <p><strong>PGP Key:</strong> Available at skillbridge.io/.well-known/security.gpg</p>
    </div>

    <div className="sp-card">
      <h2>✅ Our Security Practices</h2>
      <ul>
        <li>Passwords are hashed using bcrypt with a minimum cost factor of 12</li>
        <li>Payment processing is handled entirely by PCI-DSS compliant providers — we never store card numbers</li>
        <li>Access to production systems is restricted to authorized personnel with MFA enforced</li>
        <li>All administrative actions are logged in an immutable audit trail</li>
        <li>Regular backups with disaster recovery tested quarterly</li>
        <li>Dependency vulnerabilities are scanned automatically via GitHub Dependabot</li>
      </ul>
    </div>

    <div className="sp-card">
      <h2>🔐 Protect Your Own Account</h2>
      <ul>
        <li>Use a strong, unique password for SkillBridge</li>
        <li>Enable two-factor authentication in account settings</li>
        <li>Never share your login credentials with anyone</li>
        <li>Log out from shared or public devices</li>
        <li>Be cautious of phishing emails — SkillBridge will never ask for your password via email</li>
      </ul>
    </div>
  </StaticPageLayout>
);

export default SecurityPage;
