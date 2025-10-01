
import { useEffect, useState } from "react";
import { ref, get, getDatabase, update } from "firebase/database";
import { getApp } from "firebase/app";

const fetchAllOrders = async () => {
  const db = getDatabase(getApp());
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  const orders = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      if (user.orders) {
        Object.entries(user.orders).forEach(([orderKey, order]) => {
          orders.push({
            ...order,
            uid,
            orderKey,
            customer: user.displayName || user.email
          });
        });
      }
    });
  }
  return orders;
};


const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipmentEdits, setShipmentEdits] = useState({});

  const handleEditChange = (orderKey, field, value) => {
    setShipmentEdits(prev => ({
      ...prev,
      [orderKey]: {
        ...(prev[orderKey] || {}),
        [field]: value
      }
    }));
  };

  const saveShipment = async (order) => {
    try {
      const db = getDatabase(getApp());
      const edits = shipmentEdits[order.orderKey] || {};
      const payload = {
        awb: edits.awb || '',
        courier: edits.courier || '',
        trackingUrl: edits.awb ? `https://shiprocket.co/tracking/${edits.awb}` : '',
        updatedAt: new Date().toISOString()
      };
      await update(ref(db, `users/${order.uid}/orders/${order.orderKey}/shipment`), payload);
      // Reflect changes locally
      setOrders(prev => prev.map(o => o.orderKey === order.orderKey ? { ...o, shipment: { ...(o.shipment || {}), ...payload } } : o));
    } catch (e) {
      alert('Failed to save shipment details');
      console.error(e);
    }
  };

  const fetchAndSaveTracking = async (order) => {
    try {
      const edits = shipmentEdits[order.orderKey] || {};
      const awb = edits.awb || order.shipment?.awb;
      if (!awb) {
        alert('Enter AWB first');
        return;
      }
      const resp = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awb })
      });
      if (!resp.ok) {
        alert('Tracking API request failed');
        return;
      }
      const data = await resp.json();
      const db = getDatabase(getApp());
      const payload = {
        tracking: data,
        current_status: data.current_status || data.status || '',
        updatedAt: new Date().toISOString()
      };
      await update(ref(db, `users/${order.uid}/orders/${order.orderKey}/shipment`), payload);
      setOrders(prev => prev.map(o => o.orderKey === order.orderKey ? { ...o, shipment: { ...(o.shipment || {}), ...payload } } : o));
    } catch (e) {
      alert('Failed to fetch/save tracking');
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
        const msg = err?.message || String(err) || 'Failed to load orders';
        setError(msg.includes('PERMISSION_DENIED') ? 'Permission denied reading orders. Update Realtime Database rules to allow admin read access to users/*.' : msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Initialize editable shipment fields for each order
    const map = {};
    orders.forEach(o => {
      map[o.orderKey] = {
        awb: o.shipment?.awb || '',
        courier: o.shipment?.courier || ''
      };
    });
    setShipmentEdits(map);
  }, [orders]);

  return (
    <div className="seller-dashboard" style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1>Seller Dashboard</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <div style={{ background: '#fff3f3', border: '1px solid #f5c2c7', padding: '12px 16px', borderRadius: 8, color: '#842029' }}>
          {error}
        </div>
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
              <th>Shipment</th>
              <th>Actions</th>
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
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="AWB"
                      value={shipmentEdits[order.orderKey]?.awb || ''}
                      onChange={(e) => handleEditChange(order.orderKey, 'awb', e.target.value)}
                      style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                    <input
                      type="text"
                      placeholder="Courier"
                      value={shipmentEdits[order.orderKey]?.courier || ''}
                      onChange={(e) => handleEditChange(order.orderKey, 'courier', e.target.value)}
                      style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                    {order.shipment?.current_status && (
                      <small>Current: {order.shipment.current_status}</small>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => saveShipment(order)} style={{ padding: '6px 10px' }}>Save Shipment</button>
                    <button onClick={() => fetchAndSaveTracking(order)} style={{ padding: '6px 10px' }}>Fetch Tracking</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerDashboard;
