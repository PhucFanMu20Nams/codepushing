# 🚀 Textura Web App - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database running
- npm or yarn

## Quick Setup (2 commands only!)

### 1. Backend Setup
```bash
cd backend
npm install
npm run migrate    # This now automatically creates admin user!
npm run dev        # Start development server
```

### 2. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev        # Start frontend development server
```

## 🎯 That's it! Your app is running!

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin/login

## 🔐 Default Admin Credentials
- **Username**: `Teekayyj`
- **Password**: `AdminTuanKiet`

## 📝 What changed?
- ✅ `npm run migrate` now automatically creates the admin user
- ✅ No need to run `node scripts/create-admin.js` separately
- ✅ Added `npm run setup` command for even quicker setup
- ✅ Admin credentials are securely created without displaying in console

## Alternative Commands

### Single Command Setup
```bash
cd backend
npm run setup      # Runs migrate + dev in sequence
```

### Manual Admin Creation (if needed)
```bash
npm run create-admin    # Still available if needed
```

---

**Note**: The admin user is automatically created during migration, so you can skip the manual admin creation step!
