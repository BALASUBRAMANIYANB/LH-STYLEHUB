const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service ready');
  }
});

async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: `"LH STYLEHUB" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Email templates
function generateOrderConfirmationHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation - LH STYLEHUB</h2>
      <p>Dear ${order.shippingAddress.firstName} ${order.shippingAddress.lastName},</p>
      <p>Thank you for your order! Your order has been successfully placed.</p>

      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>

      <h3>Shipping Address:</h3>
      <p>${order.shippingAddress.address}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}</p>

      <h3>Items Ordered:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Total:</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>₹${order.total}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${order.shipment ? `
      <h3>Shipping Information:</h3>
      <p><strong>AWB Number:</strong> ${order.shipment.awb || 'Pending'}</p>
      <p><strong>Courier:</strong> ${order.shipment.courier || 'Shiprocket'}</p>
      ${order.shipment.trackingUrl ? `<p><strong>Track your order:</strong> <a href="${order.shipment.trackingUrl}">Click here</a></p>` : ''}
      ` : ''}

      <p>You will receive updates on your order status via email.</p>
      <p>Thank you for shopping with LH STYLEHUB!</p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        LH STYLEHUB<br>
        Luxury Streetwear<br>
        support@lhstylehub.com
      </p>
    </div>
  `;
}

function generateSellerNotificationHTML(order, customerEmail) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Order Received - LH STYLEHUB</h2>

      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
      <p><strong>Customer Email:</strong> ${customerEmail}</p>

      <h3>Shipping Address:</h3>
      <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}<br>
      Phone: ${order.shippingAddress.phone}</p>

      <h3>Items Ordered:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Total:</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>₹${order.total}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${order.shipment ? `
      <h3>Shipping Information:</h3>
      <p><strong>AWB Number:</strong> ${order.shipment.awb || 'Pending'}</p>
      <p><strong>Shipment ID:</strong> ${order.shipment.shipmentId || 'Pending'}</p>
      <p><strong>Courier:</strong> ${order.shipment.courier || 'Shiprocket'}</p>
      ${order.shipment.trackingUrl ? `<p><strong>Tracking URL:</strong> <a href="${order.shipment.trackingUrl}">${order.shipment.trackingUrl}</a></p>` : ''}
      ` : '<p><strong>Shipping:</strong> Not yet processed</p>'}

      <p>Please process this order promptly.</p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        LH STYLEHUB Admin Notification<br>
        This is an automated message.
      </p>
    </div>
  `;
}

// Email sending functions
async function sendOrderConfirmation(order) {
  const html = generateOrderConfirmationHTML(order);
  return await sendEmail(order.shippingAddress.email, `Order Confirmation - ${order.orderId}`, html);
}

async function sendSellerNotification(order, customerEmail) {
  const html = generateSellerNotificationHTML(order, customerEmail);
  const sellerEmail = process.env.SELLER_EMAIL || process.env.GMAIL_USER; // Send to seller/admin email
  return await sendEmail(sellerEmail, `New Order - ${order.orderId}`, html);
}

module.exports = { sendEmail, sendOrderConfirmation, sendSellerNotification };
