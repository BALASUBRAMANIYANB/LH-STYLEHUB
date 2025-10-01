import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/admin/orders');
        setOrders(res.data);
      } catch (err) {
        setError('Failed to fetch orders');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-orders">
      <h2>Order Management</h2>
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>User</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.userEmail}</td>
              <td>{order.status}</td>
              <td>{order.total}</td>
              <td>{order.date}</td>
              <td>
                {/* Actions: update status, view details, etc. */}
                <button>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderManagement;
