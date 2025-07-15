# 🏪 Textura - Modern E-commerce Web Application

[![Security](https://img.shields.io/badge/Security-Enhanced-green)](https://github.com/PhucFanMu20Nams/codepushing)
[![Environment](https://img.shields.io/badge/Environment-Variables-blue)](https://github.com/PhucFanMu20Nams/codepushing)
[![Dynamic Filters](https://img.shields.io/badge/Filters-Dynamic-orange)](https://github.com/PhucFanMu20Nams/codepushing)

A modern, secure e-commerce web application built with React frontend and Node.js backend, featuring dynamic product filtering, comprehensive security measures, and environment-based configuration.

---

## 📋 **Table of Contents**

- [� Overview](#overview)
- [✨ Features](#features)
- [🛡️ Security Features](#security-features)
- [🏗️ Architecture](#architecture)
- [📋 Prerequisites](#prerequisites)
- [🚀 Quick Start](#quick-start)
- [⚙️ Installation](#installation)
- [🔧 Configuration](#configuration)
- [�‍♂️ Running the Application](#running-the-application)
- [🧪 Testing](#testing)
- [📁 Project Structure](#project-structure)
- [🔌 API Documentation](#api-documentation)
- [🛡️ Security Guide](#security-guide)
- [🚀 Deployment](#deployment)
- [🤝 Contributing](#contributing)
- [📜 License](#license)

---

## 🎯 **Overview**

Textura is a full-stack e-commerce application that provides a seamless shopping experience with robust security measures. The application features dynamic product filtering, secure file uploads, comprehensive authentication, and production-ready security configurations.

### **Key Highlights:**
- 🔐 **Enterprise-grade security** with environment variable management
- ⚡ **Dynamic filtering system** with real-time API-driven options  
- 🎨 **Modern React frontend** with responsive design
- 🛡️ **Secure Node.js backend** with MongoDB integration
- 📱 **Mobile-first responsive design**
- 🚀 **Production-ready** with comprehensive deployment guides

---

## ✨ **Features**

### **Frontend Features**
- 🛍️ **Product Catalog** - Browse products with detailed information
- 🔍 **Dynamic Filtering** - Real-time filtering by category, brand, type, and color
- 🛒 **Shopping Cart** - Add, remove, and manage cart items
- � **User Authentication** - Secure login and registration
- 📱 **Responsive Design** - Optimized for all device sizes
- ⚡ **Performance Optimized** - Caching, debouncing, and lazy loading
- 🎨 **Modern UI/UX** - Clean, intuitive interface

### **Backend Features**
- 🔐 **Secure Authentication** - JWT-based with rate limiting
- 📁 **File Upload System** - Secure image uploads with validation
- 🗄️ **MongoDB Integration** - Scalable database with proper indexing
- 🛡️ **Security Middleware** - CORS, Helmet, rate limiting
- 📊 **Dynamic API Endpoints** - Real-time data generation
- 🚀 **Performance Optimized** - Connection pooling and caching
- 📈 **Monitoring Ready** - Comprehensive logging and error handling

### **Admin Features**
- 👨‍💼 **Product Management** - Add, edit, delete products
- 📊 **Analytics Dashboard** - Sales and performance metrics
- 🔧 **System Configuration** - Manage application settings
- 📁 **File Management** - Upload and organize product images

---

## 🛡️ **Security Features**

### **Environment Variable Security**
- ✅ **No hardcoded secrets** in source code
- ✅ **Environment-specific configuration** (dev/staging/production)
- ✅ **Automatic security validation** for production deployments
- ✅ **Secure credential management**

### **Authentication & Authorization**
- ✅ **JWT-based authentication** with configurable expiration
- ✅ **Rate limiting** to prevent brute force attacks
- ✅ **Secure password hashing** with bcrypt
- ✅ **Login attempt monitoring** and account lockout

### **File Upload Security**
- ✅ **MIME type validation** and file extension checking
- ✅ **File size limits** and upload restrictions
- ✅ **Secure filename generation** with crypto
- ✅ **Directory traversal protection**
- ✅ **Virus scanning ready** (configurable)

### **Request Security**
- ✅ **CORS protection** with configurable origins
- ✅ **Security headers** (Helmet.js integration)
- ✅ **Request size limits** and validation
- ✅ **XSS and CSRF protection**

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST APIs     │    │ • Collections   │
│ • State Mgmt    │    │ • Auth System   │    │ • Indexes       │
│ • Routing       │    │ • File Upload   │    │ • Aggregation   │
│ • Caching       │    │ • Security      │    │ • Replication   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

**Frontend:**
- React 19.1.0 with Hooks
- React Router DOM for navigation
- CSS3 with responsive design
- Vite for build tooling
- ESLint for code quality

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Helmet for security headers
- bcryptjs for password hashing

**Development & Security:**
- Environment variable management
- Comprehensive testing suite
- Production-ready deployment configs
- Security validation and monitoring

---

## 📋 **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git** for version control

### **System Requirements**
- **OS:** Windows 10+, macOS 10.15+, or Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB available space
- **Network:** Internet connection for dependencies

---

## 🚀 **Quick Start**

Get the application running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/PhucFanMu20Nams/codepushing.git
cd codepushing

# 2. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# 3. Set up environment variables
cd backend
cp .env.example .env
# Edit .env with your configuration

# 4. Start MongoDB (if running locally)
mongod

# 5. Seed the database
npm run seed

# 6. Start the application
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

🎉 **Application is now running!**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## ⚙️ **Installation**

### **Step 1: Clone Repository**
```bash
git clone https://github.com/PhucFanMu20Nams/codepushing.git
cd codepushing
```

### **Step 2: Install Dependencies**

**Root dependencies (optional styling):**
```bash
npm install
```

**Backend dependencies:**
```bash
cd backend
npm install
```

**Frontend dependencies:**
```bash
cd frontend
npm install
```

### **Step 3: Database Setup**

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

## 🔧 **Configuration**

### **Environment Variables Setup**

**Backend Configuration (`backend/.env`):**
```bash
# Copy template
cp backend/.env.example backend/.env
```

**Required Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/textura_db

# Authentication (CRITICAL - Generate strong secret!)
JWT_SECRET=your-super-secure-jwt-secret-64-chars-minimum
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=development

# File Upload
UPLOAD_MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=images/products

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-session-secret
```

### **Generate Secure Secrets**
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Frontend Configuration**

The frontend automatically connects to the backend. Update `frontend/src/utils/apiService.js` if needed:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';
```

---

## �‍♂️ **Running the Application**

### **Development Mode**

**1. Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**2. Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# Application opens at http://localhost:5173
```

### **Production Mode**

**1. Build Frontend:**
```bash
cd frontend
npm run build
```

**2. Start Production Server:**
```bash
cd backend
NODE_ENV=production npm start
```

### **Database Operations**

**Seed Database:**
```bash
cd backend
npm run seed
```

**Create Admin User:**
```bash
cd backend
npm run create-admin
```

**Check Database Connection:**
```bash
cd backend
npm run check-db
```

---

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend

# Test environment variables
node -e "require('dotenv').config(); console.log('JWT Secret:', !!process.env.JWT_SECRET)"

# Test database connection
npm run check-db

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products/category-options
```

### **Frontend Testing**
```bash
cd frontend

# Lint code
npm run lint

# Build test
npm run build

# Preview production build
npm run preview
```

### **Security Testing**
```bash
cd backend

# Test multer configuration
node -e "console.log('Multer:', require('./config/multer.config.js').config ? 'Enhanced' : 'Basic')"

# Test app configuration
node -e "console.log('Security Level:', require('./config/app.config.js').getConfigSummary().securityLevel)"
```

---

## � **Project Structure**

```
codepushing/
├── 📄 README.md                    # This file
├── 📄 package.json                 # Root dependencies
├── 📁 frontend/                    # React frontend
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 index.html
│   ├── 📁 src/
│   │   ├── 📄 App.jsx              # Main app component
│   │   ├── 📄 main.jsx             # Entry point
│   │   ├── 📁 components/          # React components
│   │   │   ├── 📄 ProductPage.jsx  # Product listing with filters
│   │   │   ├── 📄 ProductCard.jsx  # Individual product display
│   │   │   └── 📄 ...
│   │   ├── 📁 Admin/               # Admin components
│   │   ├── 📁 context/             # React context
│   │   └── 📁 utils/               # Utility functions
│   │       ├── 📄 apiService.js    # API communication
│   │       ├── 📄 cacheManager.js  # Caching system
│   │       └── 📄 filterSystemTester.js
│   └── 📁 public/                  # Static assets
├── 📁 backend/                     # Node.js backend
│   ├── 📄 package.json
│   ├── 📄 server.js                # Main server file
│   ├── 📄 .env.example             # Environment template
│   ├── 📁 config/                  # Configuration files
│   │   ├── 📄 app.config.js        # Central config with security
│   │   ├── 📄 auth.config.js       # Authentication config
│   │   ├── 📄 db.config.js         # Database config
│   │   └── 📄 multer.config.js     # File upload config
│   ├── 📁 controllers/             # Request handlers
│   │   ├── 📄 authController.js    # Authentication logic
│   │   └── 📄 productController.js # Product operations
│   ├── 📁 models/                  # Database models
│   │   ├── 📄 Admin.js             # Admin user model
│   │   ├── 📄 Product.js           # Product model
│   │   └── 📄 index.js             # Model exports
│   ├── 📁 routes/                  # API routes
│   │   ├── 📄 auth.js              # Authentication routes
│   │   ├── 📄 products.js          # Product routes
│   │   └── 📄 cache.js             # Cache routes
│   ├── 📁 middleware/              # Express middleware
│   │   ├── 📄 auth.middleware.js   # Auth verification
│   │   └── 📄 upload.middleware.js # File upload handling
│   ├── 📁 services/                # Business logic
│   │   └── 📄 productServices.js   # Product operations
│   ├── 📁 utils/                   # Utility functions
│   │   └── 📄 cacheManager.js      # Server-side caching
│   ├── 📁 validators/              # Input validation
│   │   └── 📄 productValidators.js # Product validation
│   ├── 📁 scripts/                 # Database scripts
│   │   └── 📄 seed-mongodb.js      # Database seeding
│   ├── 📁 images/                  # Uploaded files
│   │   └── 📁 products/            # Product images
│   └── 📁 data/                    # Initial data
│       ├── 📄 products.json        # Sample products
│       └── 📄 admins.json          # Admin users
└── 📁 docs/                        # Documentation
    ├── 📄 SECURITY_SETUP_GUIDE.md  # Security implementation
    ├── 📄 SECURITY_DEMONSTRATION.md # Security examples
    ├── 📄 ENV_SETUP_GUIDE.md       # Environment setup
    └── 📄 ENVIRONMENT_IMPLEMENTATION_TEST_RESULTS.md
```

---

## 🔌 **API Documentation**

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication Endpoints**
```http
POST /auth/login
POST /auth/register
POST /auth/logout
GET  /auth/profile
```

### **Product Endpoints**
```http
GET    /products                    # Get all products
GET    /products/:id                # Get product by ID
POST   /products                    # Create product (Admin)
PUT    /products/:id                # Update product (Admin)
DELETE /products/:id                # Delete product (Admin)
GET    /products/search             # Search products
GET    /products/category-options   # Get filter options
```

### **File Upload Endpoints**
```http
POST /products/upload               # Upload product images
```

### **Cache Endpoints**
```http
GET    /cache/stats                 # Get cache statistics
DELETE /cache/clear                 # Clear cache (Admin)
```

### **Example API Calls**

**Get Products with Filters:**
```bash
curl "http://localhost:5000/api/products?category=Footwear&brand=Nike"
```

**Get Dynamic Filter Options:**
```bash
curl "http://localhost:5000/api/products/category-options"
```

**Search Products:**
```bash
curl "http://localhost:5000/api/products/search?q=nike"
```

---

## 🛡️ **Security Guide**

### **Environment Variable Security**

**✅ What's Secured:**
- Database credentials (`MONGODB_URI`)
- JWT secrets (`JWT_SECRET`)
- File upload configuration (`UPLOAD_DIR`, `UPLOAD_MAX_FILE_SIZE`)
- CORS settings (`CORS_ORIGINS`)
- Rate limiting (`RATE_LIMIT_MAX_REQUESTS`)
- Session secrets (`SESSION_SECRET`)

**🔧 Security Features:**
- Automatic production validation
- Strong secret requirements (64+ characters)
- Environment-specific configurations
- Secure file upload with MIME validation
- Directory traversal protection
- Request size limitations

### **Production Security Checklist**

**Before Deployment:**
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Set production MongoDB URI
- [ ] Configure production CORS origins
- [ ] Set appropriate file upload limits
- [ ] Enable security headers (Helmet)
- [ ] Configure rate limiting
- [ ] Set up SSL/TLS certificates
- [ ] Enable secure cookies
- [ ] Configure proper logging

**Security Validation:**
```bash
# Check security configuration
node -e "
const config = require('./backend/config/app.config.js');
console.log('Security Check:', config.isSecureEnvironment());
console.log('Validation:', config.validateEnvironment());
"
```

---

## 🚀 **Deployment**

### **Environment-Specific Deployment**

**Development:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/textura_dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/textura_prod
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=your-super-secure-64-character-secret
UPLOAD_MAX_FILE_SIZE=2097152  # 2MB for production
RATE_LIMIT_MAX_REQUESTS=50    # Lower for production
```

### **Docker Deployment**

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### **Cloud Deployment**

**Heroku:**
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

**Vercel (Frontend):**
```bash
# Install Vercel CLI
npm i -g vercel
cd frontend
vercel --prod
```

---

## 🤝 **Contributing**

We welcome contributions! Please follow these guidelines:

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Set up environment variables
5. Make your changes
6. Test thoroughly
7. Commit: `git commit -m 'Add amazing feature'`
8. Push: `git push origin feature/amazing-feature`
9. Open a Pull Request

### **Code Standards**
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure security best practices

### **Security Contributions**
- Never commit `.env` files
- Use environment variables for all secrets
- Follow OWASP security guidelines
- Test security configurations

---

## 📞 **Support & Contact**

- **GitHub Issues:** [Report bugs or request features](https://github.com/PhucFanMu20Nams/codepushing/issues)
- **Documentation:** Check the `docs/` folder for detailed guides
- **Security Issues:** Report privately to repository maintainers

---

## � **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🎉 **Acknowledgments**

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- All contributors and the open-source community

---

## 📊 **Project Status**

- ✅ **Backend:** Production-ready with comprehensive security
- ✅ **Frontend:** Responsive and optimized
- ✅ **Security:** Environment variables implemented
- ✅ **Dynamic Filters:** Fully functional
- ✅ **Database:** MongoDB integration complete
- ✅ **Documentation:** Comprehensive guides available

**Ready for production deployment!** 🚀

---

## 👨‍💻 **Author**

**PhucFanMu20Nams**

---

*Last updated: January 15, 2025*
