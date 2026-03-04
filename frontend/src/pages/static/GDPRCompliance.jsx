import React from 'react';
import { Link } from 'react-router-dom';
import StaticPageLayout from '../../components/StaticPageLayout';

const GDPRCompliance = () => (
  <StaticPageLayout
    title="GDPR Compliance"
    subtitle="SkillBridge's commitment to the General Data Protection Regulation for users in the EU and EEA."
    breadcrumb={[{ label: 'Legal' }, { label: 'GDPR Compliance' }]}
    heroColor="linear-gradient(135deg, #003399 0%, #667eea 100%)"
  >
    <span className="sp-legal-date">Last updated: March 1, 2026</span>

    <div className="sp-card">
      <h2>🇪🇺 Our GDPR Commitment</h2>
      <p>SkillBridge Technologies Pvt. Ltd. is committed to complying with the General Data Protection Regulation (GDPR) for all users in the European Union and European Economic Area. This page explains how we handle your rights and obligations under GDPR.</p>
    </div>

    <div className="sp-card">
      <h2>⚖️ Legal Basis for Processing</h2>
      <ul>
        <li><strong>Contract Performance:</strong> Processing your account data and internship activity to deliver the services you signed up for.</li>
        <li><strong>Legitimate Interest:</strong> Platform security, fraud prevention, and improving our services through anonymized analytics.</li>
        <li><strong>Consent:</strong> Marketing emails and optional analytics cookies — withdrawable at any time.</li>
        <li><strong>Legal Obligation:</strong> Retaining financial records as required by applicable tax and accounting laws.</li>
      </ul>
    </div>

    <div className="sp-card">
      <h2>🔏 Your GDPR Rights</h2>
      <div className="sp-grid-2">
        {[
          { icon: '👁️', right: 'Right to Access', desc: 'Request a full copy of all personal data we hold about you.' },
          { icon: '✏️', right: 'Right to Rectification', desc: 'Correct inaccurate or incomplete personal data at any time.' },
          { icon: '🗑️', right: 'Right to Erasure', desc: 'Request deletion of your personal data ("right to be forgotten").' },
          { icon: '📦', right: 'Right to Portability', desc: 'Receive your data in a structured, machine-readable format.' },
          { icon: '🛑', right: 'Right to Object', desc: 'Object to processing based on legitimate interests or for direct marketing.' },
          { icon: '⏸️', right: 'Right to Restriction', desc: 'Request that we restrict processing of your data in certain circumstances.' },
        ].map((r, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1.2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
            <div><div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{r.right}</div><div style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.desc}</div></div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: '#64748b' }}>To exercise any of these rights, email <strong>privacy@skillbridge.io</strong>. We will respond within 30 days.</p>
    </div>

    <div className="sp-card">
      <h2>🌍 International Data Transfers</h2>
      <p>SkillBridge is headquartered in India. If we transfer data to countries outside the EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission or adequacy decisions.</p>
    </div>

    <div className="sp-card">
      <h2>📩 Data Protection Officer</h2>
      <p>Our Data Protection Officer oversees all GDPR compliance matters and is your primary point of contact for data rights requests.</p>
      <p style={{ marginTop: '0.75rem' }}><strong>DPO Email:</strong> dpo@skillbridge.io</p>
      <p>You also have the right to lodge a complaint with your local supervisory authority if you believe your data rights have been violated.</p>
    </div>

    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <Link to="/privacy" className="sp-btn sp-btn-gradient" style={{ padding: '0.75rem 1.5rem' }}>Privacy Policy</Link>
      <Link to="/cookies" className="sp-btn" style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#374151', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Cookie Policy</Link>
    </div>
  </StaticPageLayout>
);

export default GDPRCompliance;
