# 🔐 Security Setup Guide - Environment Variables

## 📋 **Overview**

This guide shows how all sensitive information has been moved from hardcoded values to environment variables for enhanced security.

---

## ✅ **What Was Secured**

### **Before (Insecure - Hardcoded Values):**
```javascript
// ❌ INSECURE - Hardcoded in source code
const uploadDir = path.join(__dirname, '../images/products');
const fileSize = 5 * 1024 * 1024; // 5MB
app.use(cors()); // No origin restrictions
```

### **After (Secure - Environment Variables):**
```javascript
// ✅ SECURE - From environment variables
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'images/products';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024);
const CORS_ORIGINS = process.env.CORS_ORIGINS.split(',');
```

---

## 🛠️ **Setup Instructions**

### **Step 1: Copy Environment Template**
```bash
# In the backend directory
cp .env.example .env
```

### **Step 2: Configure Your Environment Variables**

Edit the `.env` file with your specific values:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/textura_db

# Authentication (CRITICAL - Change in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Upload Configuration
UPLOAD_MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_MAX_FILES=10
UPLOAD_DIR=images/products
UPLOAD_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

# CORS Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15
```

### **Step 3: Generate Secure JWT Secret**
```bash
# Generate a cryptographically secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Step 4: Verify Environment Loading**
```bash
# Test environment variables are loaded
cd backend
node -e "require('dotenv').config(); console.log('JWT Secret loaded:', !!process.env.JWT_SECRET)"
```

---

## 🚀 **Environment-Specific Configurations**

### **Development (.env)**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/textura_dev
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug
```

### **Production (.env)**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/textura_prod
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=warn
UPLOAD_MAX_FILE_SIZE=2097152  # 2MB for production
```

### **Testing (.env.test)**
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/textura_test
CORS_ORIGINS=http://localhost:3001
UPLOAD_MAX_FILE_SIZE=1048576  # 1MB for testing
```

---

## 🔒 **Security Features Implemented**

### **1. File Upload Security**
- ✅ Configurable file size limits
- ✅ Restricted file extensions from environment
- ✅ Upload directory protection
- ✅ Maximum files per upload limit

### **2. CORS Protection**
- ✅ Configurable allowed origins
- ✅ Environment-specific CORS settings
- ✅ Production origin validation

### **3. Authentication Security**
- ✅ JWT secrets from environment
- ✅ Production secret validation (minimum 32 chars)
- ✅ Automatic fallback detection warnings

### **4. Rate Limiting**
- ✅ Configurable request limits
- ✅ Time window configuration
- ✅ Environment-specific limits

### **5. Database Security**
- ✅ Connection strings from environment
- ✅ No hardcoded credentials
- ✅ Environment-specific databases

---

## 🛡️ **Security Validations**

The application now includes automatic security checks:

### **Production Warnings:**
```javascript
// Warns if using fallback values in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('🚨 CRITICAL: JWT secret too short for production!');
    process.exit(1);
  }
}
```

### **Configuration Validation:**
```javascript
// Validates required environment variables on startup
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`🚨 Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});
```

---

## 📁 **Files Modified for Security**

### **Configuration Files:**
- ✅ `config/multer.config.js` - Upload configuration from env
- ✅ `config/db.config.js` - Database from env
- ✅ `config/auth.config.js` - JWT secrets from env
- ✅ `config/app.config.js` - Centralized configuration
- ✅ `server.js` - CORS and static files from env

### **Environment Files:**
- ✅ `.env` - Development configuration
- ✅ `.env.example` - Template for all environments
- ✅ `.gitignore` - Ensures .env files aren't committed

---

## ⚠️ **Critical Security Notes**

### **DO NOT:**
- ❌ Commit `.env` files to version control
- ❌ Use default JWT secrets in production
- ❌ Share `.env` files in chat/email
- ❌ Use development settings in production

### **DO:**
- ✅ Use strong, unique JWT secrets (64+ characters)
- ✅ Restrict CORS origins to your domains only
- ✅ Set appropriate file upload limits
- ✅ Use environment-specific configurations
- ✅ Monitor for security warnings in logs

---

## 🔧 **Troubleshooting**

### **Environment Variables Not Loading:**
```bash
# Check if .env file exists
ls -la .env

# Test environment loading
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
```

### **CORS Issues:**
```bash
# Check CORS configuration
node -e "require('dotenv').config(); console.log('CORS Origins:', process.env.CORS_ORIGINS)"
```

### **Upload Issues:**
```bash
# Check upload configuration
node -e "
require('dotenv').config();
console.log('Upload Dir:', process.env.UPLOAD_DIR);
console.log('Max Size:', process.env.UPLOAD_MAX_FILE_SIZE);
console.log('Extensions:', process.env.UPLOAD_ALLOWED_EXTENSIONS);
"
```

---

## 🎯 **Quick Start Checklist**

- [ ] Copy `.env.example` to `.env`
- [ ] Generate strong JWT secret
- [ ] Configure MongoDB URI
- [ ] Set appropriate CORS origins
- [ ] Adjust upload limits if needed
- [ ] Test environment variable loading
- [ ] Verify application starts without errors
- [ ] Check security warnings in console

**Your application is now properly secured with environment variables!** 🔐
