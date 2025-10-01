---
description: Repository Information Overview
alwaysApply: true
---

# LH CLOTHING Information

## Summary
LH CLOTHING is a luxury streetwear e-commerce platform built with React 18, Firebase backend, and modern web development practices. It offers a complete shopping experience with product catalog, user authentication, shopping cart, checkout process, and order management.

## Structure
- **src/**: Core application code
  - **components/**: Reusable UI components (Header, Footer, ProductCard, etc.)
  - **pages/**: Page components (Home, Products, Checkout, etc.)
  - **contexts/**: React Context providers (Auth, Cart)
  - **firebase/**: Firebase configuration
  - **utils/**: Utility functions
- **public/**: Static assets (images, videos)
- **build/**: Production build output
- **server.js**: Express server for Shiprocket tracking API

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18.2.0
**Build System**: Create React App 5.0.1
**Package Manager**: npm
**Node.js**: v16+ required

## Dependencies
**Main Dependencies**:
- React 18.2.0: Frontend framework
- Firebase 12.2.1: Backend services (auth, database)
- React Router 6.8.1: Client-side routing
- Express 5.1.0: Backend server for API
- Framer Motion 10.12.4: Animations
- Razorpay 2.9.6: Payment processing

**Development Dependencies**:
- React Scripts 5.0.1: Development and build tools
- ESLint: Code quality and consistency

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Firebase Integration
**Configuration**: Firebase config in src/firebase/config.js
**Services**:
- Authentication: Email/password login
- Realtime Database: User data, products, orders
- Cloud Storage: Image and file storage

## Main Files
**Entry Points**:
- src/index.js: Application entry point
- src/App.js: Main application component
- server.js: Express server for API

**Key Components**:
- src/components/Header.js: Navigation and cart
- src/components/CartSidebar.js: Shopping cart UI
- src/pages/Checkout.js: Checkout process
- src/contexts/AuthContext.js: Authentication state
- src/contexts/CartContext.js: Shopping cart state

## Testing
**Framework**: React Testing Library (via react-scripts)
**Run Command**:
```bash
npm test
```