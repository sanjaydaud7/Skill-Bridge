import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/internships', icon: 'library_books', label: 'Internships' },
    { path: '/admin/submissions', icon: 'assignment', label: 'Submissions' },
    { path: '/admin/enrollments', icon: 'school', label: 'Enrollments' },
    { path: '/admin/users', icon: 'people', label: 'Users' },
    { path: '/admin/certificates', icon: 'card_membership', label: 'Certificates' },
    { path: '/admin/payments', icon: 'payment', label: 'Payments' },
    { path: '/admin/analytics', icon: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-sidebar-item ${
              location.pathname === item.path ? 'active' : ''
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <Link to="/" className="back-to-site">
          <span className="material-icons">arrow_back</span>
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
