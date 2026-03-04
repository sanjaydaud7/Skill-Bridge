import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="Have a question, partnership inquiry, or feedback? We'd love to hear from you."
      breadcrumb={[{ label: 'Company' }, { label: 'Contact' }]}
      heroColor="linear-gradient(135deg, #0ea5e9 0%, #667eea 100%)"
    >
      <div className="sp-grid-2" style={{ marginBottom: '2rem' }}>
        <div className="sp-grid-card">
          <div className="card-icon">📧</div>
          <h3>Email Us</h3>
          <p>support@skillbridge.io</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>We respond within 24 hours</p>
        </div>
        <div className="sp-grid-card">
          <div className="card-icon">💬</div>
          <h3>Live Chat</h3>
          <p>Available Monday – Friday, 9 AM – 6 PM IST via the chat widget in your dashboard.</p>
        </div>
        <div className="sp-grid-card">
          <div className="card-icon">🏢</div>
          <h3>Head Office</h3>
          <p>SkillBridge Technologies Pvt. Ltd.<br />91 Springboard, Koramangala<br />Bangalore, Karnataka 560034</p>
        </div>
        <div className="sp-grid-card">
          <div className="card-icon">🤝</div>
          <h3>Partnerships</h3>
          <p>partners@skillbridge.io</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>For company onboarding inquiries</p>
        </div>
      </div>

      <div className="sp-card">
        <h2>✉️ Send a Message</h2>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Message Sent!</h3>
            <p style={{ color: '#64748b' }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form className="sp-form" onSubmit={handleSubmit}>
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="sp-form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="sp-form-group">
              <label>Subject</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                <option value="">Select a topic</option>
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership Inquiry</option>
                <option>Billing</option>
                <option>Report an Issue</option>
              </select>
            </div>
            <div className="sp-form-group">
              <label>Message</label>
              <textarea rows={5} placeholder="Tell us how we can help..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className="sp-btn sp-btn-gradient">Send Message</button>
          </form>
        )}
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
