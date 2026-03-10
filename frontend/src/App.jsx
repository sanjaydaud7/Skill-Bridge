import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ResumeBuilder from './pages/ResumeBuilder';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InternshipDetail from './pages/InternshipDetail';
import InternshipView from './pages/InternshipView';
import TasksView from './pages/TasksView';
import CertificatesView from './pages/CertificatesView';
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInternships from './pages/admin/AdminInternships';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminResources from './pages/admin/AdminResources';
// Static Pages
import AboutUs from './pages/static/AboutUs';
import OurTeam from './pages/static/OurTeam';
import Careers from './pages/static/Careers';
import NewsUpdates from './pages/static/NewsUpdates';
import Contact from './pages/static/Contact';
import Investors from './pages/static/Investors';
import RemoteOpportunities from './pages/static/RemoteOpportunities';
import TechInternships from './pages/static/TechInternships';
import BusinessInternships from './pages/static/BusinessInternships';
import DesignInternships from './pages/static/DesignInternships';
import ForCompanies from './pages/static/ForCompanies';
import HelpCenter from './pages/static/HelpCenter';
import FAQ from './pages/static/FAQ';
import StudentGuides from './pages/static/StudentGuides';
import Resources from './pages/static/Resources';
import CommunityForum from './pages/static/CommunityForum';
import GiveFeedback from './pages/static/GiveFeedback';
import PrivacyPolicy from './pages/static/PrivacyPolicy';
import TermsOfService from './pages/static/TermsOfService';
import CookiePolicy from './pages/static/CookiePolicy';
import SecurityPage from './pages/static/SecurityPage';
import Accessibility from './pages/static/Accessibility';
import GDPRCompliance from './pages/static/GDPRCompliance';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internship/:id" element={<InternshipDetail />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard/internship/:courseId" element={<InternshipView />} />
        <Route path="/dashboard/internship/:courseId/tasks" element={<TasksView />} />
        <Route path="/dashboard/certificates" element={<CertificatesView />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/internships" element={<AdminRoute><AdminInternships /></AdminRoute>} />
        <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
        <Route path="/admin/enrollments" element={<AdminRoute><AdminEnrollments /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/certificates" element={<AdminRoute><AdminCertificates /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />

        {/* Company Routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/news" element={<NewsUpdates />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/investors" element={<Investors />} />

        {/* Internship Category Routes */}
        <Route path="/internships/browse" element={<Navigate to="/" replace />} />
        <Route path="/internships/remote" element={<RemoteOpportunities />} />
        <Route path="/internships/tech" element={<TechInternships />} />
        <Route path="/internships/business" element={<BusinessInternships />} />
        <Route path="/internships/design" element={<DesignInternships />} />
        <Route path="/for-companies" element={<ForCompanies />} />

        {/* Support Routes */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/student-guides" element={<StudentGuides />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/community" element={<CommunityForum />} />
        <Route path="/feedback" element={<GiveFeedback />} />

        {/* Legal Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/gdpr" element={<GDPRCompliance />} />

        {/* New Feature Routes */}
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/portfolio" element={<Navigate to="/portfolio/me" replace />} />
        <Route path="/portfolio/me" element={<Portfolio />} />
        <Route path="/portfolio/:username" element={<Portfolio />} />
      </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;