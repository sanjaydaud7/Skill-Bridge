import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const PrivacyPolicy = () => (
  <StaticPageLayout
    title="Privacy Policy"
    subtitle="How we collect, use, and protect your personal information."
    breadcrumb={[{ label: 'Legal' }, { label: 'Privacy Policy' }]}
    heroColor="linear-gradient(135deg, #1e293b 0%, #667eea 100%)"
  >
    <span className="sp-legal-date">Last updated: March 1, 2026</span>

    <div className="sp-legal-toc">
      <h4>Table of Contents</h4>
      <ol>
        {['Information We Collect','How We Use Your Information','Information Sharing','Data Retention','Your Rights','Cookies','Security','Children\'s Privacy','Changes to This Policy','Contact Us'].map((s, i) => (
          <li key={i}><a href={`#section-${i+1}`}>{s}</a></li>
        ))}
      </ol>
    </div>

    {[
      { id: 1, icon: '📦', title: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, password, educational background, and profile details when you create an account. We also collect internship application data, task submissions, payment information (processed securely via third-party providers), and communications you send us. We automatically collect certain technical information such as IP address, browser type, device type, pages visited, and usage patterns through cookies and similar technologies.' },
      { id: 2, icon: '🎯', title: 'How We Use Your Information', body: 'We use your information to provide and improve our services, match you with relevant internship opportunities, process payments, send important platform notifications, provide customer support, generate anonymized analytics to improve our platform, and comply with legal obligations. We do not sell your personal data to third parties.' },
      { id: 3, icon: '🤝', title: 'Information Sharing', body: 'We share your information with partner companies only when you apply to their internships, and only the information relevant to that application. We share data with trusted service providers (payment processors, email delivery, cloud hosting) who are contractually bound to protect it. We may disclose information if required by law or to protect the rights and safety of SkillBridge, our users, or the public.' },
      { id: 4, icon: '🗓️', title: 'Data Retention', body: 'We retain your account data for as long as your account is active. Certificates and completion records are retained indefinitely to support verification. You may request deletion of your account and associated data at any time by contacting privacy@skillbridge.io.' },
      { id: 5, icon: '⚖️', title: 'Your Rights', body: 'Depending on your location, you may have the right to access, correct, delete, or export your personal data; withdraw consent where processing is based on consent; and opt out of marketing communications at any time via the unsubscribe link in any email or through your account settings.' },
      { id: 6, icon: '🍪', title: 'Cookies', body: 'We use essential cookies to keep you logged in and remember your preferences, analytics cookies to understand how users interact with our platform, and optional marketing cookies. You can manage cookie preferences through your browser settings. See our Cookie Policy for full details.' },
      { id: 7, icon: '🔐', title: 'Security', body: 'We implement industry-standard security measures including TLS encryption for data in transit, AES-256 encryption for sensitive data at rest, multi-factor authentication options, regular security audits, and SOC 2-aligned practices. No system is 100% secure — please use a strong unique password and enable 2FA.' },
      { id: 8, icon: '👶', title: "Children's Privacy", body: "SkillBridge is not directed to individuals under 16 years of age. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such information, please contact us immediately." },
      { id: 9, icon: '🔄', title: 'Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email and by displaying a prominent notice on our platform at least 30 days before changes take effect.' },
      { id: 10, icon: '📩', title: 'Contact Us', body: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@skillbridge.io or write to: SkillBridge Technologies Pvt. Ltd., 91 Springboard, Koramangala, Bangalore, Karnataka 560034, India.' },
    ].map(s => (
      <div className="sp-card" key={s.id} id={`section-${s.id}`}>
        <h2>{s.icon} {s.id}. {s.title}</h2>
        <p>{s.body}</p>
      </div>
    ))}
  </StaticPageLayout>
);

export default PrivacyPolicy;
