# 🚀 LH CLOTHING - Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Shiprocket account with API credentials
- Gmail account with App Password

## 🔧 Environment Variables Required

Create these environment variables in Vercel:

```bash
# Shiprocket Configuration
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_PICKUP_LOCATION=your-pickup-location-name
SHIPROCKET_CHANNEL_ID=your-channel-id

# Email Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
SELLER_EMAIL=admin-email@example.com

# Firebase (if needed)
# Add your Firebase config variables
```

## 🚀 Automatic Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy LH CLOTHING with automated shipments"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Vercel will auto-detect the configuration

### Step 3: Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all the environment variables listed above

### Step 4: Deploy
Vercel will automatically build and deploy when you push to GitHub.

## 📁 Project Structure

```
lh-clothing/
├── vercel.json          # Vercel deployment config
├── .vercelignore        # Files to exclude from deployment
├── server.js            # Node.js backend server
├── shiprocketTrackingRoute.js  # API routes
├── package.json         # Dependencies and scripts
├── src/                 # React frontend
├── public/              # Static assets
└── .env                 # Local environment (not deployed)
```

## 🔗 API Endpoints

Once deployed, your backend will be available at:
`https://your-project-name.vercel.app`

Frontend API calls will automatically use this URL.

## ✅ Features Included

- ✅ **Automatic AWB Generation** - Shipments created via Shiprocket API
- ✅ **Email Notifications** - Customer confirmations and seller alerts
- ✅ **Admin Dashboard** - Complete order management interface
- ✅ **Real-time Tracking** - Integration with Shiprocket tracking
- ✅ **Payment Processing** - Razorpay integration
- ✅ **User Authentication** - Firebase Auth

## 🧪 Testing After Deployment

1. **Place a test order** on your live site
2. **Check Admin Dashboard** - AWB should be auto-populated
3. **Check customer email** - Should receive order confirmation
4. **Check seller email** - Should receive order notification

## 🔧 Troubleshooting

### Issue: Shipment not creating
- Check Shiprocket credentials in Vercel env vars
- Verify pickup location and channel ID

### Issue: Emails not sending
- Verify Gmail App Password
- Check Gmail account security settings

### Issue: Build failing
- Check Vercel build logs
- Ensure all dependencies are in package.json

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check Shiprocket dashboard for order creation

## 🎉 Success!

Once deployed, your LH CLOTHING store will have:
- **Automated order processing**
- **Real-time shipment tracking**
- **Professional email notifications**
- **Complete admin management**

Happy selling! 🛍️💰