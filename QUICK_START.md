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
npm run seed      # This seeds the database AND creates the admin user with proper password hashing
npm run dev       # Start development server
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
- ✅ `npm run seed` now creates the database AND admin user with proper password hashing
- ✅ `npm run migrate` is now an alias for `npm run seed` (complete setup)
- ✅ Added `npm run full-setup` command for complete installation + seeding + server start
- ✅ Admin credentials are securely created and hashed during database seeding

## Alternative Commands

### Single Command Setup
```bash
cd backend
npm run setup         # Runs seed + dev in sequence
npm run full-setup    # Runs install + seed + dev in sequence (complete setup from scratch)
```

### Manual Admin Creation (if needed)
```bash
npm run create-admin    # Still available if needed, but npm run seed does this automatically
```

---

**Note**: The admin user is now automatically created during database seeding with `npm run seed`. The password is properly hashed and secured. If you ever need to reset the admin password, you can run `npm run create-admin` or just re-run `npm run seed`!
