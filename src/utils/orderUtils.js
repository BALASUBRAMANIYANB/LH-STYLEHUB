// Utility functions for order management

const safe = (v, fallback = '') => (v === undefined || v === null ? fallback : v);
const sanitize = (obj) => {
  try {
    // Remove undefined recursively; Firebase doesn't accept undefined
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};

export const createOrder = (cartItems, userInfo, shippingAddress) => {
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const safeUser = {
    firstName: safe(userInfo?.firstName, ''),
    lastName: safe(userInfo?.lastName, ''),
    email: safe(userInfo?.email, ''),
    phone: safe(userInfo?.phone, '')
  };

  const safeAddress = {
    firstName: safe(shippingAddress?.firstName, safeUser.firstName),
    lastName: safe(shippingAddress?.lastName, safeUser.lastName),
    email: safe(shippingAddress?.email, safeUser.email),
    phone: safe(shippingAddress?.phone, safeUser.phone),
    address: safe(shippingAddress?.address, ''),
    city: safe(shippingAddress?.city, ''),
    state: safe(shippingAddress?.state, ''),
    zipCode: safe(shippingAddress?.zipCode, ''),
    country: safe(shippingAddress?.country, 'India')
  };
  
  const order = {
    orderId,
    items: (cartItems || []).map(item => ({
      id: safe(item.id, ''),
      name: safe(item.name, ''),
      price: Number(item.price) || 0,
      selectedSize: safe(item.selectedSize, ''),
      quantity: Number(item.quantity) || 1,
      image: safe(item.image, '')
    })),
    total: (cartItems || []).reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0),
    status: 'pending',
    userInfo: safeUser,
    shippingAddress: safeAddress,
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  };

  return sanitize(order);
};

export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ff9500';
    case 'processing':
      return '#007bff';
    case 'shipped':
      return '#28a745';
    case 'delivered':
      return '#28a745';
    case 'cancelled':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

export const getOrderStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Order Pending';
    case 'processing':
      return 'Processing Order';
    case 'shipped':
      return 'Order Shipped';
    case 'delivered':
      return 'Order Delivered';
    case 'cancelled':
      return 'Order Cancelled';
    default:
      return 'Unknown Status';
  }
};

export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
