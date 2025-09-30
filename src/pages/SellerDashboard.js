
import { useEffect, useState } from "react";
import { ref, get, getDatabase } from "firebase/database";
import { getApp } from "firebase/app";

const fetchAllOrders = async () => {
  const db = getDatabase(getApp());
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  const orders = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      if (users[uid].orders) {
        Object.values(users[uid].orders).forEach(order => {
          orders.push({ ...order, customer: users[uid].displayName || users[uid].email });
        });
      }
    });
  }
  return orders;
};


const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="seller-dashboard" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1>Seller Dashboard</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.orderId || idx} style={{ borderBottom: "1px solid #eee" }}>
                <td>{order.orderId}</td>
                <td>{order.customer}</td>
                <td>
                  {order.items && order.items.map((item, i) => (
                    <div key={i}>{item.name} x{item.quantity}</div>
                  ))}
                </td>
                <td>{order.total}</td>
                <td>{order.status}</td>
                <td>{order.orderDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerDashboard;
