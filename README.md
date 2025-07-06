# Textura - Modern E-commerce Fashion Platform

A modern, responsive e-commerce platform for fashion and lifestyle products built with React, Express.js, and PostgreSQL. Features a sophisticated product catalog, advanced filtering system, and a sleek user interface with enhanced product categorization.

## 🌟 Latest Updates (v2.0)

### 🆕 New Product ID System
- **Structured Product IDs**: Products now use standardized PD#### format (PD0001, PD0002, etc.)
- **SEO-Friendly URLs**: Direct access via `localhost:5173/PD0001` format
- **Enhanced Breadcrumbs**: New format - `Category / Brand / Type / Color / Style`

### 🎨 Enhanced Product Information
- **Color Fields**: Detailed color information (e.g., "White/Black", "Black/White")
- **Style Categories**: Product styles (Classic, Retro, Vintage, Tennis, Basic, Casual)
- **Comprehensive Filtering**: Filter by brand, type, color, style, and price range

### 🔍 Advanced Filtering System
- **Multi-Select Filters**: Choose multiple brands, colors, styles simultaneously
- **Real-Time Results**: Instant filtering with backend database queries
- **Cache Management**: Smart cache invalidation for fresh filter results
- **Category-Specific Filters**: Different filter options per category

## 🌟 Core Features

### Frontend Features
- **Modern UI/UX**: Clean, responsive design with Inter font typography
- **Advanced Search**: Real-time product search with autocomplete dropdown
- **Smart Filtering**: Multi-criteria filtering with checkboxes and price ranges
- **Product Catalog**: Grid-based product display with hover effects
- **Enhanced Navigation**: Dynamic routing with product ID support
- **Product Details**: Comprehensive product pages with new breadcrumb system
- **Popular Items Section**: Curated product showcase with centered layout
- **Mobile Responsive**: Optimized for all device sizes

### Backend Features
- **RESTful API**: Well-structured API endpoints with advanced filtering
- **Database Filtering**: SQL-based filtering for brands, types, colors, styles
- **Multi-Value Support**: Handle comma-separated filter values
- **Product Search**: Advanced search with query parameters and pagination
- **Image Management**: Static file serving for product images
- **Database Integration**: PostgreSQL with Sequelize ORM and enhanced schema
- **Error Handling**: Comprehensive error handling and logging

## 🛠 Tech Stack

- **Frontend**: 
  - React 18 with Hooks
  - React Router for navigation
  - CSS3 with custom styling
  - Vite for build tooling
  
- **Backend**: 
  - Express.js
  - Sequelize ORM
  - PostgreSQL database
  - Node.js runtime

- **Development Tools**:
  - ESLint for code quality
  - Git for version control
  - VS Code configuration

## � Current Product Catalog

### Available Products
- **PD0001**: Nike Dunk Low - White/Black, Classic style
- **PD0002**: Nike Dunk Low Retro Panda - Black/White, Retro style  
- **PD0003**: Adidas Samba OG - Black/White, Vintage style
- **PD0004**: Nike Sportswear Club Button-Up - Black, Casual style
- **PD0005**: Nike Sportswear Club T-Shirt SS25 - White, Basic style
- **PD0006**: Nike Killshot 2 Leather - White/Green, Tennis style

### Product Access
- **Direct URLs**: Access products directly via `localhost:5173/PD0001`
- **Category Pages**: Browse by Footwear, Clothes, Accessories, Service
- **Filter Options**: Filter by Brand (Nike, Adidas), Color, Style, Type

## �🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PhucFanMu20Nams/texturaalmost.git
   cd texturaalmost
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### 📊 Database Configuration

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE textura_db;
   ```

2. **Environment Configuration**
   Create `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=123
   DB_NAME=textura_db
   DB_PORT=5432
   ```

3. **Initialize Database**
   ```bash
   cd backend
   node migrations/execute-sql-file.js
   ```

### 🎯 Running the Application

1. **Start Backend Server** (Simplified - 2 commands only!)
   ```bash
   cd backend
   npm run migrate    # Automatically creates admin user
   npm run dev        # Start development server
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

3. **Access Admin Panel**
   - URL: http://localhost:5173/admin/login
   - Username: `Teekayyj`
   - Password: `AdminTuanKiet`

### ⚡ Quick Start (Alternative)
```bash
cd backend
npm run setup      # Runs migrate + dev in one command
```
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 📱 Project Structure

```
textura2306/
├── backend/
│   ├── config/          # Database configuration
│   ├── data/           # SQL initialization scripts
│   ├── images/         # Static product images
│   ├── migrations/     # Database migration scripts
│   ├── models/         # Sequelize models
│   ├── routes/         # API route handlers
│   └── server.js       # Express server setup
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context providers
│   │   ├── assets/     # Frontend assets
│   │   └── main.jsx    # App entry point
│   └── vite.config.js  # Vite configuration
└── README.md
```

## 🔌 API Endpoints

### Products API

- **GET** `/api/products` - Get all products
  - Query params: `page`, `limit`, `category`, `brand`
  - Response: Paginated product list

- **GET** `/api/products/search` - Search products
  - Query params: `q` (search term), `page`, `limit`
  - Response: Filtered products with search relevance

- **GET** `/api/products/:id` - Get single product
  - Response: Detailed product information

### Example API Usage

```javascript
// Search for Nike products
fetch('http://localhost:5000/api/products/search?q=nike&limit=12')
  .then(res => res.json())
  .then(data => console.log(data.products));

// Get paginated products
fetch('http://localhost:5000/api/products?page=1&limit=6')
  .then(res => res.json())
  .then(data => console.log(data.products));
```

## 💾 Database Schema

### Core Tables

1. **products** - Main product information
   - id, name, brand, price, category, subcategory, type, image

2. **product_details** - Product descriptions
   - id, productId (FK), detail

3. **product_images** - Product gallery
   - id, productId (FK), imageUrl

4. **product_sizes** - Available sizes
   - id, productId (FK), size

## 🎨 UI Components

### Key Components

- **Header**: Navigation with mega menu and search functionality
- **PopularItems**: Featured products grid with centered shop button
- **SearchResults**: Advanced search results with pagination
- **ProductDetail**: Comprehensive product information display
- **Footer**: Modern footer with social links

### Styling Features

- **Responsive Grid**: 3-column desktop, 2-column tablet, adaptive mobile
- **Interactive Elements**: Hover effects, smooth transitions
- **Typography**: Inter font family for modern look
- **Color Scheme**: Professional black/white/gray palette

## 🛒 Featured Products

Current product catalog includes:

- **Nike Collection**: Dunk Low, Retro Panda, Killshot 2 Leather
- **Adidas**: Samba OG series
- **Apparel**: Nike Sportswear Club items
- **Price Range**: 550,000 VND - 2,300,000 VND

## 📝 Development Notes

### Recent Updates
- ✅ Fixed footer overlap in search results
- ✅ Improved product display formatting
- ✅ Enhanced responsive design
- ✅ Centered shop button in popular items
- ✅ Added comprehensive product search

### Code Quality
- ESLint configuration for consistent code style
- Modular component architecture
- Reusable CSS classes and utilities
- Error handling and fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 👨‍💻 Author

**PhucFanMu20Nams**
**teekayyj-dotcom**
