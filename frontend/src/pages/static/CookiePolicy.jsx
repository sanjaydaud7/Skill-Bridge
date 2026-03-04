import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const cookies = [
  { name: 'sb_session', type: 'Essential', duration: 'Session', purpose: 'Keeps you logged in during your browsing session.' },
  { name: 'sb_remember', type: 'Essential', duration: '30 days', purpose: 'Remembers your login when "Remember me" is selected.' },
  { name: 'sb_prefs', type: 'Functional', duration: '1 year', purpose: 'Stores your theme and display preferences.' },
  { name: '_ga', type: 'Analytics', duration: '2 years', purpose: 'Google Analytics — tracks page views and usage patterns.' },
  { name: '_gid', type: 'Analytics', duration: '24 hours', purpose: 'Google Analytics — distinguishes between users.' },
  { name: 'sb_consent', type: 'Essential', duration: '1 year', purpose: 'Records your cookie consent preferences.' },
];

const typeColors = { Essential: '#11998e', Functional: '#667eea', Analytics: '#f5a623', Marketing: '#f64f59' };

const CookiePolicy = () => {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <StaticPageLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies on SkillBridge."
      breadcrumb={[{ label: 'Legal' }, { label: 'Cookie Policy' }]}
      heroColor="linear-gradient(135deg, #f5a623 0%, #1e293b 100%)"
    >
      <span className="sp-legal-date">Last updated: March 1, 2026</span>

      <div className="sp-card">
        <h2>🍪 What Are Cookies?</h2>
        <p>Cookies are small text files placed on your device when you visit a website. They help the website remember your preferences, keep you logged in, and understand how you use the site. SkillBridge uses cookies to deliver a better, more personalized experience.</p>
      </div>

      <div className="sp-card">
        <h2>⚙️ Manage Your Preferences</h2>
        <p style={{ marginBottom: '1.25rem' }}>Essential cookies are always active as they are required for the platform to function. You can toggle optional cookie categories below.</p>

        {[
          { label: 'Essential Cookies', desc: 'Required for login, security, and core functionality. Cannot be disabled.', enabled: true, locked: true },
          { label: 'Analytics Cookies', desc: 'Help us understand how users navigate SkillBridge so we can improve it.', enabled: analytics, locked: false, toggle: () => setAnalytics(v => !v) },
          { label: 'Marketing Cookies', desc: 'Used to show relevant ads outside of SkillBridge (e.g., retargeting).', enabled: marketing, locked: false, toggle: () => setMarketing(v => !v) },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '10px', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>{c.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{c.desc}</div>
            </div>
            <div
              onClick={!c.locked ? c.toggle : undefined}
              style={{ width: '48px', height: '26px', borderRadius: '13px', background: c.enabled ? '#667eea' : '#d1d5db', position: 'relative', cursor: c.locked ? 'not-allowed' : 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: '3px', left: c.enabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="sp-card">
        <h2>📋 Cookies We Use</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Cookie Name','Type','Duration','Purpose'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#374151', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {cookies.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#1e293b', fontWeight: '500' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: typeColors[c.type], color: 'white', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: '700' }}>{c.type}</span></td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{c.duration}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default CookiePolicy;
