import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const guides = [
  { icon: '📝', title: 'Complete Your Profile', steps: ['Add a professional photo and bio', 'List your skills and education', 'Link your GitHub, LinkedIn, or portfolio', 'Set availability and preferred internship type'] },
  { icon: '🔎', title: 'Finding the Right Internship', steps: ['Use filters by category, duration, and remote/in-person', 'Read the full internship description carefully', 'Check the required skills for a match', 'Look at company reviews from past interns'] },
  { icon: '📤', title: 'Submitting Your First Task', steps: ['Read the task brief thoroughly before starting', 'Follow the submission format specified', 'Double-check your work before hitting submit', 'Wait for mentor feedback within 48 hours'] },
  { icon: '🏆', title: 'Earning Your Certificate', steps: ['Complete all module tasks with a passing score', 'Submit and pass the final project', 'Purchase your verified certificate', 'Download and share your PDF certificate or LinkedIn badge'] },
  { icon: '💼', title: 'Using Your Certificate', steps: ['Add it to your LinkedIn profile under "Certifications"', 'Include the verification URL in your resume', 'Share it on your portfolio website', 'Use it when applying for full-time jobs'] },
  { icon: '🤝', title: 'Getting the Most from Mentorship', steps: ['Respond promptly to mentor feedback', 'Come prepared with specific questions', 'Share updates on blockers early', 'Ask for a recommendation letter after completion'] },
];

const StudentGuides = () => (
  <StaticPageLayout
    title="Student Guides"
    subtitle="Step-by-step guides to help you get the most out of your SkillBridge experience."
    breadcrumb={[{ label: 'Support' }, { label: 'Student Guides' }]}
    heroColor="linear-gradient(135deg, #667eea 0%, #f64f59 100%)"
  >
    {guides.map((g, i) => (
      <div className="sp-card" key={i}>
        <h2>{g.icon} {g.title}</h2>
        <ul>
          {g.steps.map((s, j) => <li key={j}>{s}</li>)}
        </ul>
      </div>
    ))}
  </StaticPageLayout>
);

export default StudentGuides;
