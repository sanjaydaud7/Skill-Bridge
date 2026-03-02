import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import '../../styles/AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    INTERNSHIP: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundData, setRefundData] = useState({
    amount: 0,
    reason: ''
  });

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await api.get(`/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPayments(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    if (!window.confirm('Verify this payment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/payments/${paymentId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const openRefundModal = (payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount,
      reason: ''
    });
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (refundData.reason.length < 10) {
      alert('Reason must be at least 10 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post(`/admin/payments/${selectedPayment._id}/refund`, refundData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowRefundModal(false);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-payments">
        <div className="payments-header">
          <div>
            <h1>Payment Management</h1>
            <p>Track and manage internship payments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="payments-filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            placeholder="End Date"
          />
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : (
          <>
            <div className="payments-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Internship</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments && payments.length > 0 ? payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <div className="user-info">
                          <div>{payment.userId?.name}</div>
                          <div className="user-email">{payment.userId?.email}</div>
                        </div>
                      </td>
                      <td>{payment.courseId?.title}</td>
                      <td>
                        <strong className="amount">₹{payment.amount}</strong>
                      </td>
                      <td>
                        <span className={`method-badge ${payment.paymentMethod}`}>
                          {payment.paymentMethod === 'stripe' ? 'Card' : 
                           payment.paymentMethod === 'bypass' ? 'Test' : payment.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${payment.status}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {payment.status === 'pending' && (
                            <button
                              className="btn-icon verify"
                              onClick={() => handleVerify(payment._id)}
                              title="Verify"
                            >
                              <span className="material-icons">check_circle</span>
                            </button>
                          )}
                          {payment.status === 'completed' && (
                            <button
                              className="btn-icon refund"
                              onClick={() => openRefundModal(payment)}
                              title="Refund"
                            >
                              <span className="material-icons">money_off</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="empty-message">
                        <div className="empty-state">
                          <span className="material-icons">payment</span>
                          <p>No payments found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedPayment && (
          <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Process Refund</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowRefundModal(false)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="info-section">
                  <h3>Payment Details</h3>
                  <div className="info-row">
                    <span>User:</span>
                    <strong>{selectedPayment.userId?.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Internship:</span>
                    <strong>{selectedPayment.courseId?.title}</strong>
                  </div>
                  <div className="info-row">
                    <span>Original Amount:</span>
                    <strong>₹{selectedPayment.amount}</strong>
                  </div>
                  <div className="info-row">
                    <span>Payment Method:</span>
                    <strong>{selectedPayment.paymentMethod}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>Refund Amount</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedPayment.amount}
                    value={refundData.amount}
                    onChange={(e) => setRefundData({...refundData, amount: parseFloat(e.target.value)})}
                  />
                  <small>Maximum: ₹{selectedPayment.amount}</small>
                </div>

                <div className="form-group">
                  <label>Reason for Refund *</label>
                  <textarea
                    rows="4"
                    value={refundData.reason}
                    onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                    placeholder="Provide detailed reason for refund (minimum 10 characters)..."
                  />
                </div>

                <div className="warning-box">
                  <span className="material-icons">warning</span>
                  <div>
                    <strong>Warning:</strong> This action cannot be undone. 
                    {selectedPayment.paymentMethod === 'stripe' && 
                      ' The refund will be processed through Stripe.'}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowRefundModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleRefund}
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
