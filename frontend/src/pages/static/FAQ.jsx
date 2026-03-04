import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const faqs = [
  { q: 'How do I register on SkillBridge?', a: 'Click "Register" in the top navigation, fill in your name, email, and password, and verify your email address. You can explore internships immediately after registration.' },
  { q: 'Are the internships free to join?', a: 'Browsing and enrolling in internships is completely free. A one-time certificate fee is charged only when you successfully complete an internship and choose to purchase your verified certificate.' },
  { q: 'How do I apply for an internship?', a: 'Browse the internship catalog, click on any listing you\'re interested in, and hit "Apply Now". You may need to complete a short skill assessment before enrollment is confirmed.' },
  { q: 'How are tasks evaluated?', a: 'Tasks are reviewed by assigned mentors within 48 hours of submission. You\'ll receive a score, written feedback, and the option to revise your submission if needed.' },
  { q: 'Can I do multiple internships at once?', a: 'Yes! You can be enrolled in up to 3 internship tracks simultaneously. We recommend starting with one to understand the workflow before taking on more.' },
  { q: 'How does the certificate work?', a: 'Upon completing all tasks and the final project, a verified digital certificate is issued with a unique certificate number that employers can verify on our website.' },
  { q: 'What is the refund policy?', a: 'Certificate fees are non-refundable once issued. If you have not yet completed the internship and wish to cancel, contact support within 7 days of enrollment for a full refund.' },
  { q: 'Can companies verify my certificate?', a: 'Yes. Every certificate has a unique verification URL. Employers can visit that link to confirm the certificate\'s authenticity and the skills demonstrated.' },
  { q: 'Are internships remote or in-person?', a: 'Most SkillBridge internships are fully remote and task-based, allowing you to complete them on your own schedule. Some partner companies offer hybrid or in-person options.' },
  { q: 'How do I reset my password?', a: 'Click "Login", then "Forgot Password". Enter your email address and you\'ll receive a reset link within 5 minutes. Check your spam folder if you don\'t see it.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <StaticPageLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about SkillBridge internships, certificates, and your account."
      breadcrumb={[{ label: 'Support' }, { label: 'FAQ' }]}
      heroColor="linear-gradient(135deg, #f5a623 0%, #764ba2 100%)"
    >
      {faqs.map((faq, i) => (
        <div className="sp-faq-item" key={i}>
          <div className="sp-faq-question" onClick={() => setOpen(open === i ? null : i)}>
            {faq.q}
            <span style={{ fontSize: '1.2rem', fontWeight: '400', color: '#667eea', flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
          </div>
          {open === i && <div className="sp-faq-answer">{faq.a}</div>}
        </div>
      ))}

      <div className="sp-cta-block" style={{ marginTop: '2rem' }}>
        <h2>Didn't find your answer?</h2>
        <p>Our support team is ready to help you with anything not covered here.</p>
        <a href="/contact" className="sp-btn sp-btn-white">Contact Support</a>
      </div>
    </StaticPageLayout>
  );
};

export default FAQ;
