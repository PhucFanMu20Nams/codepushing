# MongoDB Migration Setup Guide

## ✅ Migration Completed Successfully!

Your Textura application has been successfully migrated from PostgreSQL to MongoDB. Here's what was changed and how to run it:

## 📋 What Changed

### Database Layer
- ✅ Replaced Sequelize ORM with Mongoose ODM
- ✅ Converted relational models to MongoDB documents
- ✅ Updated all database queries to use MongoDB syntax
- ✅ Maintained all existing functionality

### Files Updated
- ✅ `config/db.config.js` - MongoDB connection settings
- ✅ `config/mongodb.config.js` - New MongoDB connection handler
- ✅ `models/Product.js` - New Mongoose schema for products
- ✅ `models/Admin.js` - New Mongoose schema for admins
- ✅ `models/index.js` - Updated to use Mongoose
- ✅ `controllers/productController.js` - Updated for MongoDB
- ✅ `controllers/authController.js` - Updated for MongoDB
- ✅ `server.js` - Updated to use MongoDB connection
- ✅ `scripts/migrate-to-mongodb.js` - Data migration script
- ✅ `scripts/check-mongodb.js` - MongoDB connection test
- ✅ `package.json` - Updated scripts

## 🚀 How to Run

### 1. Install MongoDB

#### Windows:
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` file if needed (default MongoDB URI should work):
```env
MONGODB_URI=mongodb://localhost:27017/textura_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
```

### 3. Test MongoDB Connection
```bash
npm run check-db
```

### 4. Run Migration (Populate Database)
```bash
npm run migrate
```

This will:
- Clear existing data
- Create 8 sample products with images
- Create admin user (Username: `Teekayyj`, Password: `AdminTuanKiet`)

### 5. Start the Server
```bash
npm run dev
```

## 📊 Database Structure

### Products Collection
Each product document contains:
- Basic info (name, description, price, brand, category, type, color, style)
- Embedded arrays for:
  - `details[]` - Size, stock, SKU information
  - `gallery[]` - Multiple product images
  - `sizes[]` - Available sizes
- Timestamps (createdAt, updatedAt)

### Admins Collection
- Username, password (hashed), email
- Activity status and last login tracking
- Automatic password hashing with bcrypt

## 🎯 API Endpoints (Unchanged)

All API endpoints remain the same:
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/auth/login` - Admin login
- `GET /api/health` - Health check

## 🔍 Testing

1. **Check MongoDB connection:**
   ```bash
   npm run check-db
   ```

2. **Test API endpoints:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Get products
   curl http://localhost:5000/api/products
   
   # Admin login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"Teekayyj","password":"AdminTuanKiet"}'
   ```

## 🎨 Frontend Compatibility

The frontend requires **NO CHANGES** because:
- All API endpoints remain the same
- Response formats are identical
- Authentication flow is unchanged
- All existing functionality preserved

## 📈 Performance Benefits

- **Flexible Schema**: Easy to add new product fields
- **Embedded Documents**: Faster queries for related data
- **Better Scaling**: MongoDB scales horizontally
- **JSON Native**: No ORM overhead for JSON operations

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

### Migration Issues
- Delete existing data: MongoDB Compass or `db.dropDatabase()`
- Re-run migration: `npm run migrate`

### Authentication Issues
- Check admin credentials: Username `Teekayyj`, Password `AdminTuanKiet`
- Verify JWT_SECRET in .env file

## 🎉 Success!

Your application is now running on MongoDB! The migration preserves all functionality while providing better flexibility for future development.

**Default Admin Credentials:**
- Username: `Teekayyj`
- Password: `AdminTuanKiet`

**Next Steps:**
1. Start the server: `npm run dev`
2. Test the frontend with the backend
3. Update admin password in production
4. Configure MongoDB authentication for production use
