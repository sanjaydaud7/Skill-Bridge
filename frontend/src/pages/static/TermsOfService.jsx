import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const TermsOfService = () => (
  <StaticPageLayout
    title="Terms of Service"
    subtitle="Please read these terms carefully before using SkillBridge."
    breadcrumb={[{ label: 'Legal' }, { label: 'Terms of Service' }]}
    heroColor="linear-gradient(135deg, #374151 0%, #764ba2 100%)"
  >
    <span className="sp-legal-date">Last updated: March 1, 2026</span>

    <div className="sp-legal-toc">
      <h4>Table of Contents</h4>
      <ol>
        {['Acceptance of Terms','Account Registration','Internship Platform Rules','Intellectual Property','Payments & Refunds','Prohibited Conduct','Termination','Disclaimer of Warranties','Limitation of Liability','Governing Law'].map((s, i) => (
          <li key={i}><a href={`#tos-${i+1}`}>{s}</a></li>
        ))}
      </ol>
    </div>

    {[
      { id: 1, icon: '✅', title: 'Acceptance of Terms', body: 'By accessing or using SkillBridge, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services. These terms apply to all users including students, company partners, and visitors.' },
      { id: 2, icon: '👤', title: 'Account Registration', body: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 16 years old to register. SkillBridge reserves the right to refuse service or terminate accounts at its discretion.' },
      { id: 3, icon: '📋', title: 'Internship Platform Rules', body: 'Students agree to complete internship tasks honestly and submit original work. Plagiarism, AI-generated submission without disclosure, or misrepresentation of skills may result in immediate termination of the internship and revocation of any issued certificates. Company partners agree to provide meaningful work aligned with the stated internship description.' },
      { id: 4, icon: '©️', title: 'Intellectual Property', body: 'SkillBridge and its content, features, and functionality are owned by SkillBridge Technologies Pvt. Ltd. and are protected by intellectual property laws. Project work completed during internships may be subject to separate IP agreements between students and partner companies. Certificates issued by SkillBridge remain the property of SkillBridge and may not be altered or forged.' },
      { id: 5, icon: '💳', title: 'Payments & Refunds', body: 'Internship enrollment is free. Certificate fees are charged upon completion and are non-refundable once the certificate has been issued. Enrollment cancellations requested within 7 days and before task completion may be eligible for a full refund. All payments are processed through secure third-party processors. SkillBridge does not store full payment card details.' },
      { id: 6, icon: '🚫', title: 'Prohibited Conduct', body: 'You agree not to: impersonate another person or entity; upload false or misleading information; attempt to gain unauthorized access to any system; use automated tools to scrape or extract data; engage in harassment or abusive behavior toward other users or staff; or use SkillBridge for any unlawful purpose.' },
      { id: 7, icon: '🔚', title: 'Termination', body: 'SkillBridge may terminate or suspend your account immediately, without prior notice or liability, for any reason including breach of these Terms. Upon termination, your right to use the platform ceases immediately. Sections of these Terms that by their nature should survive termination will survive.' },
      { id: 8, icon: '⚠️', title: 'Disclaimer of Warranties', body: 'SkillBridge is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the platform will be error-free, uninterrupted, or that internship completion will result in employment. Career outcomes depend on individual effort, skills, and market conditions.' },
      { id: 9, icon: '📊', title: 'Limitation of Liability', body: 'To the maximum extent permitted by applicable law, SkillBridge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or opportunities, arising out of or related to your use of the platform.' },
      { id: 10, icon: '⚖️', title: 'Governing Law', body: 'These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India.' },
    ].map(s => (
      <div className="sp-card" key={s.id} id={`tos-${s.id}`}>
        <h2>{s.icon} {s.id}. {s.title}</h2>
        <p>{s.body}</p>
      </div>
    ))}
  </StaticPageLayout>
);

export default TermsOfService;
