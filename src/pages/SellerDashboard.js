
import { useEffect, useState } from "react";
import { ref, get, getDatabase, update, push, remove } from "firebase/database";
import { getApp } from "firebase/app";
import { useAuth } from '../contexts/AuthContext';

const fetchAllOrders = async () => {
  const db = getDatabase(getApp());
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  const orders = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      // Get user profile info (excluding orders and cart)
      const userProfile = { ...user };
      delete userProfile.orders;
      delete userProfile.cart;

      if (user.orders) {
        Object.entries(user.orders).forEach(([orderKey, order]) => {
          orders.push({
            ...order,
            uid,
            orderKey,
            customer: userProfile.displayName || userProfile.email || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Unknown Customer',
            customerEmail: userProfile.email || '',
            customerPhone: userProfile.phone || '',
            userProfile: userProfile
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
  const [statusEdits, setStatusEdits] = useState({});
  const { populateUserProfiles } = useAuth();

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

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const db = getDatabase(getApp());
      await update(ref(db, `users/${order.uid}/orders/${order.orderKey}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setOrders(prev => prev.map(o => o.orderKey === order.orderKey ? { ...o, status: newStatus } : o));
      alert(`Order status updated to ${newStatus}`);
    } catch (e) {
      alert('Failed to update order status');
      console.error(e);
    }
  };

  const cancelOrder = async (order) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    try {
      const db = getDatabase(getApp());
      await update(ref(db, `users/${order.uid}/orders/${order.orderKey}`), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: 'Cancelled by seller'
      });
      setOrders(prev => prev.map(o => o.orderKey === order.orderKey ? { ...o, status: 'cancelled' } : o));
      alert('Order cancelled successfully');
    } catch (e) {
      alert('Failed to cancel order');
      console.error(e);
    }
  };

  const deleteOrder = async (order) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this order? This action cannot be undone and will remove all order data.')) {
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('This will permanently delete the order. Are you absolutely sure?')) {
      return;
    }

    console.log('Attempting to delete order:', {
      orderId: order.orderId,
      orderKey: order.orderKey,
      uid: order.uid
    });

    try {
      const db = getDatabase(getApp());
      const orderRef = ref(db, `users/${order.uid}/orders/${order.orderKey}`);

      // Use remove() instead of set(null) for proper deletion
      await remove(orderRef);

      // Update local state
      setOrders(prev => prev.filter(o => o.orderKey !== order.orderKey));

      console.log('Order deleted successfully:', order.orderId);
      alert('Order deleted permanently');
    } catch (e) {
      console.error('Failed to delete order:', e);
      alert(`Failed to delete order: ${e.message}`);
    }
  };

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    shippingAddress: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const updateOrderItem = (index, field, value) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeOrderItem = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const createNewOrder = async () => {
    try {
      // Create a temporary user ID for the new order
      const tempUserId = `admin-${Date.now()}`;
      const order = {
        orderId: `ADMIN-${Date.now()}`,
        items: newOrder.items,
        total: newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        userInfo: {
          firstName: newOrder.customerName.split(' ')[0] || '',
          lastName: newOrder.customerName.split(' ').slice(1).join(' ') || '',
          email: newOrder.customerEmail,
          phone: newOrder.customerPhone
        },
        shippingAddress: newOrder.shippingAddress,
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin'
      };

      const db = getDatabase(getApp());
      const orderRef = await push(ref(db, `users/${tempUserId}/orders`), order);

      // Add to local state
      const newOrderWithKey = {
        ...order,
        uid: tempUserId,
        orderKey: orderRef.key,
        customer: newOrder.customerName
      };
      setOrders(prev => [newOrderWithKey, ...prev]);

      // Reset form
      setNewOrder({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        items: [{ name: '', quantity: 1, price: 0 }],
        shippingAddress: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      });
      setShowAddOrder(false);
      alert('Order created successfully');
    } catch (e) {
      alert('Failed to create order');
      console.error(e);
    }
  };

  const handlePopulateProfiles = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('This will populate missing user profile data for all users. Continue?')) {
      return;
    }

    try {
      const count = await populateUserProfiles();
      alert(`Successfully updated ${count} user profiles`);
      // Refresh orders to show updated data
      window.location.reload();
    } catch (e) {
      alert('Failed to populate user profiles');
      console.error(e);
    }
  };

  const handleStatusChange = (orderKey, newStatus) => {
    setStatusEdits(prev => ({
      ...prev,
      [orderKey]: newStatus
    }));
  };

  const saveStatusChange = async (order) => {
    const newStatus = statusEdits[order.orderKey];
    if (newStatus && newStatus !== order.status) {
      await updateOrderStatus(order, newStatus);
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
    const shipmentMap = {};
    const statusMap = {};
    orders.forEach(o => {
      shipmentMap[o.orderKey] = {
        awb: o.shipment?.awb || '',
        courier: o.shipment?.courier || ''
      };
      statusMap[o.orderKey] = o.status || 'pending';
    });
    setShipmentEdits(shipmentMap);
    setStatusEdits(statusMap);
  }, [orders]);

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.shippingAddress?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>🏪 LH STYLEHUB Admin Dashboard</h1>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>Complete Order & Business Management</p>
        </div>

        {/* Analytics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          padding: '30px',
          background: '#f8f9fa'
        }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '2px solid #667eea'
          }}>
            <div style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '10px' }}>📦</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{orders.length}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Orders</div>
          </div>

          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '2px solid #ffc107'
          }}>
            <div style={{ fontSize: '2.5rem', color: '#ffc107', marginBottom: '10px' }}>⏳</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{pendingOrders}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Pending Orders</div>
          </div>

          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '2px solid #007bff'
          }}>
            <div style={{ fontSize: '2.5rem', color: '#007bff', marginBottom: '10px' }}>🚚</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{shippedOrders}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Shipped Orders</div>
          </div>

          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '2px solid #28a745'
          }}>
            <div style={{ fontSize: '2.5rem', color: '#28a745', marginBottom: '10px' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>₹{totalRevenue.toLocaleString()}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Revenue</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '20px 30px',
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '14px',
                width: '250px'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePopulateProfiles}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🔧 Fix User Data
            </button>
            <button
              onClick={() => setShowAddOrder(!showAddOrder)}
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {showAddOrder ? '❌ Cancel' : '➕ Add Order'}
            </button>
          </div>
        </div>

        {/* Add Order Form */}
        {showAddOrder && (
          <div style={{
            padding: '30px',
            background: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>➕ Create New Order</h3>
            <div style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#667eea' }}>👤 Customer Details</h4>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="email"
                  placeholder="Customer Email"
                  value={newOrder.customerEmail}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Customer Phone"
                  value={newOrder.customerPhone}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#667eea' }}>📍 Shipping Address</h4>
                <input
                  type="text"
                  placeholder="Address"
                  value={newOrder.shippingAddress.address}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, address: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newOrder.shippingAddress.city}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newOrder.shippingAddress.state}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={newOrder.shippingAddress.zipCode}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, zipCode: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#667eea' }}>🛒 Order Items</h4>
              {newOrder.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                    style={{
                      flex: 3,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => removeOrderItem(index)}
                    style={{
                      padding: '10px 15px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={newOrder.items.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={addOrderItem}
                  style={{
                    padding: '12px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginRight: '10px'
                  }}
                >
                  ➕ Add Item
                </button>
                <button
                  onClick={createNewOrder}
                  style={{
                    padding: '12px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Create Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div style={{ padding: '30px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
              <p style={{ fontSize: '18px', color: '#666' }}>Loading orders...</p>
            </div>
          ) : error ? (
            <div style={{
              background: '#fff3f3',
              border: '1px solid #f5c2c7',
              padding: '20px',
              borderRadius: '10px',
              color: '#842029',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
              <p style={{ fontSize: '18px', color: '#666' }}>No orders found</p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Order ID</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Customer</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Items</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Shipment</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.orderId || idx} style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>
                        {order.orderId}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{order.customer}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          📧 {order.customerEmail || order.shippingAddress?.email || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          📱 {order.customerPhone || order.shippingAddress?.phone || 'N/A'}
                        </div>
                        {order.shippingAddress && (
                          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', lineHeight: '1.3' }}>
                            📍 {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </div>
                        )}
                        {order.userProfile?.uid && (
                          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                            UID: {order.userProfile.uid.substring(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {order.items && order.items.map((item, i) => (
                          <div key={i} style={{
                            background: '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            fontSize: '12px',
                            display: 'inline-block',
                            marginRight: '4px'
                          }}>
                            {item.name} ×{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#28a745' }}>
                        ₹{order.total?.toLocaleString() || '0'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <select
                          value={statusEdits[order.orderKey] || order.status}
                          onChange={(e) => handleStatusChange(order.orderKey, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            border: `2px solid ${getStatusColor(order.status)}`,
                            borderRadius: '20px',
                            background: 'white',
                            color: getStatusColor(order.status),
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">🔄 Processing</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                        {statusEdits[order.orderKey] !== order.status && (
                          <button
                            onClick={() => saveStatusChange(order)}
                            style={{
                              marginLeft: '8px',
                              padding: '4px 12px',
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            💾 Save
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#666' }}>
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="AWB Number"
                            value={shipmentEdits[order.orderKey]?.awb || ''}
                            onChange={(e) => handleEditChange(order.orderKey, 'awb', e.target.value)}
                            style={{
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Courier"
                            value={shipmentEdits[order.orderKey]?.courier || ''}
                            onChange={(e) => handleEditChange(order.orderKey, 'courier', e.target.value)}
                            style={{
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          {order.shipment?.current_status && (
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              background: '#f0f0f0',
                              padding: '4px 8px',
                              borderRadius: '10px',
                              textAlign: 'center'
                            }}>
                              📍 {order.shipment.current_status}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => saveShipment(order)}
                            style={{
                              padding: '6px 12px',
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => fetchAndSaveTracking(order)}
                            style={{
                              padding: '6px 12px',
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            📍 Track
                          </button>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => cancelOrder(order)}
                              style={{
                                padding: '6px 12px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              🚫 Cancel
                            </button>
                          )}
                          <button
                            onClick={() => deleteOrder(order)}
                            style={{
                              padding: '6px 12px',
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
