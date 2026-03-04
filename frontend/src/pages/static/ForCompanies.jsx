import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const ForCompanies = () => {
  const [form, setForm] = useState({ company: '', name: '', email: '', size: '', message: '' });
  const [sent, setSent] = useState(false);

  return (
    <StaticPageLayout
      title="For Companies"
      subtitle="Find pre-vetted, motivated student talent for short-term projects and long-term pipelines."
      breadcrumb={[{ label: 'Internships' }, { label: 'For Companies' }]}
      heroColor="linear-gradient(135deg, #11998e 0%, #0ea5e9 100%)"
    >
      <div className="sp-grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '🎯', title: 'Pre-Vetted Talent', desc: 'Every student on SkillBridge has completed skill assessments and background checks.' },
          { icon: '⚡', title: 'Quick Onboarding', desc: 'Post a role and start receiving applications within 48 hours. We handle the logistics.' },
          { icon: '📊', title: 'Admin Dashboard', desc: 'Track intern progress, review task submissions, and give feedback — all in one place.' },
          { icon: '🏆', title: 'Employer Branding', desc: 'Feature your company profile and showcase your culture to thousands of students.' },
          { icon: '💼', title: 'Talent Pipeline', desc: 'Convert top-performing interns to full-time hires with our built-in referral tools.' },
          { icon: '🔒', title: 'IP Protection', desc: 'All interns sign NDAs and IP assignment agreements before starting.' },
        ].map((c, i) => (
          <div className="sp-grid-card" key={i}>
            <div className="card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="sp-card">
        <h2>💰 Pricing</h2>
        <div className="sp-grid-2">
          {[
            { plan: 'Starter', price: 'Free', features: ['1 active internship post', 'Up to 5 applications', 'Basic dashboard access'] },
            { plan: 'Growth', price: '₹4,999/mo', features: ['10 active posts', 'Unlimited applications', 'Advanced analytics', 'Priority support'] },
          ].map((p, i) => (
            <div key={i} style={{ border: '2px solid', borderColor: i === 1 ? '#667eea' : '#e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#667eea', marginBottom: '0.4rem' }}>{p.plan}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>{p.price}</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {p.features.map((f, j) => <li key={j} style={{ color: '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#11998e' }}>✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-card">
        <h2>📝 Get Started as a Partner</h2>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Request Received!</h3>
            <p style={{ color: '#64748b' }}>Our partnerships team will reach out within 1 business day.</p>
          </div>
        ) : (
          <form className="sp-form" onSubmit={e => { e.preventDefault(); setSent(true); }}>
            <div className="sp-form-row">
              <div className="sp-form-group"><label>Company Name</label><input type="text" placeholder="Acme Corp" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
              <div className="sp-form-group"><label>Your Name</label><input type="text" placeholder="Jane Smith" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div className="sp-form-row">
              <div className="sp-form-group"><label>Work Email</label><input type="email" placeholder="jane@company.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="sp-form-group"><label>Company Size</label>
                <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                  <option value="">Select</option>
                  <option>1–10</option><option>11–50</option><option>51–200</option><option>200+</option>
                </select>
              </div>
            </div>
            <div className="sp-form-group"><label>What are you looking for?</label><textarea rows={4} placeholder="Tell us about the roles you want to post..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
            <button type="submit" className="sp-btn sp-btn-gradient">Submit Partnership Request</button>
          </form>
        )}
      </div>
    </StaticPageLayout>
  );
};

export default ForCompanies;
