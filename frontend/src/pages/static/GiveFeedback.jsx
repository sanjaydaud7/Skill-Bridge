import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const GiveFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ type: '', message: '', email: '' });
  const [sent, setSent] = useState(false);

  return (
    <StaticPageLayout
      title="Give Feedback"
      subtitle="Your feedback shapes SkillBridge. Tell us what's working, what's not, and what you'd love to see."
      breadcrumb={[{ label: 'Support' }, { label: 'Give Feedback' }]}
      heroColor="linear-gradient(135deg, #f5a623 0%, #f64f59 100%)"
    >
      {sent ? (
        <div className="sp-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🙏</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Thank You!</h2>
          <p style={{ color: '#64748b' }}>Your feedback has been received. We read every single submission and use it to improve SkillBridge.</p>
        </div>
      ) : (
        <>
          <div className="sp-card">
            <h2>⭐ Rate Your Experience</h2>
            <p>How would you rate SkillBridge overall?</p>
            <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', fontSize: '2.5rem' }}>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  style={{ cursor: 'pointer', color: star <= (hover || rating) ? '#f5a623' : '#e5e7eb', transition: 'color 0.15s' }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >★</span>
              ))}
            </div>
          </div>

          <div className="sp-card">
            <h2>📝 Share Your Feedback</h2>
            <form className="sp-form" onSubmit={e => { e.preventDefault(); setSent(true); }}>
              <div className="sp-form-group">
                <label>Feedback Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                  <option value="">Select a category</option>
                  <option>Platform Bug / Issue</option>
                  <option>Feature Request</option>
                  <option>Internship Quality</option>
                  <option>Mentor Experience</option>
                  <option>Certificate / Payment</option>
                  <option>General Suggestion</option>
                </select>
              </div>
              <div className="sp-form-group">
                <label>Your Feedback</label>
                <textarea rows={5} placeholder="Tell us what you think — be as detailed as you like. We read every submission." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <div className="sp-form-group">
                <label>Email (optional — if you want a reply)</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <button type="submit" className="sp-btn sp-btn-gradient">Submit Feedback</button>
            </form>
          </div>
        </>
      )}
    </StaticPageLayout>
  );
};

export default GiveFeedback;
