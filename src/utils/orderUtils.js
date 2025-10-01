// Utility functions for order management

export const createOrder = (cartItems, userInfo, shippingAddress) => {
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const order = {
    orderId,
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      selectedSize: item.selectedSize,
      quantity: item.quantity,
      image: item.image
    })),
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending',
    userInfo: {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      phone: userInfo.phone
    },
    shippingAddress,
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  };

  return order;
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
