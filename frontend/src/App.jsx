import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <AuthProvider>
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
      </Routes>
    </AuthProvider>
  );
}

export default App;