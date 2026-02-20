import React from 'react';
import AdminSidebar from './AdminSidebar';
import '../../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
