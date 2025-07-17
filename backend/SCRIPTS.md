# 🚀 Backend Scripts Guide

## Simple Commands

### 🎯 **One Command Setup & Run** (Recommended)
```bash
npm run setup-and-run
```
**What it does:**
1. ✅ Installs all dependencies
2. ✅ Sets up category system
3. ✅ Verifies everything is working
4. ✅ Starts the server in development mode

### ⚡ **Quick Start** (If already set up)
```bash
npm run quick-start
```
**What it does:**
1. ✅ Initializes categories (if needed)
2. ✅ Starts the server in development mode

### 🔍 **Just Verify** (Check system health)
```bash
npm run verify
```
**What it does:**
1. ✅ Checks if category system is properly configured
2. ✅ Verifies product-category consistency
3. ✅ Shows detailed report

## Production Commands

### 🏃 **Start Server** (Production)
```bash
npm start
```

### 🛠️ **Development Mode**
```bash
npm run dev
```

## 📋 **Usage Examples**

### First Time Setup
```bash
# Clone the repo and navigate to backend
cd backend

# One command to rule them all!
npm run setup-and-run
```

### Daily Development
```bash
# Quick start for daily development
npm run quick-start
```

### Health Check
```bash
# Verify everything is working
npm run verify
```

## 🎯 **What Each Script Does**

| Script | Purpose | Use Case |
|--------|---------|----------|
| `setup-and-run` | Complete setup + run | First time setup |
| `quick-start` | Initialize + run | Daily development |
| `verify` | Health check | Troubleshooting |
| `start` | Production server | Deployment |
| `dev` | Development server | Development |

## 💡 **Tips**

- Use `setup-and-run` for **first-time setup**
- Use `quick-start` for **daily development**
- Use `verify` when something **seems broken**
- All scripts include **automatic error handling**
