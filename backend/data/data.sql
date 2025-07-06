-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_details CASCADE; 
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create tables
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255),
  type VARCHAR(255),
  color VARCHAR(255),
  style VARCHAR(255),
  image VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_details (
  id SERIAL PRIMARY KEY,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  detail TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  "imageUrl" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_sizes (
  id SERIAL PRIMARY KEY,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "lastLogin" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert product data
INSERT INTO products (id, name, brand, price, category, subcategory, type, color, style, image) VALUES 
('PD0001', 'Nike Dunk Low', 'Nike', 1800000, 'Footwear', 'Men', 'Sneaker', 'White/Black', 'Classic', '/images/products/nike-dunk-low.jpg'),
('PD0002', 'Nike Dunk Low Retro Panda', 'Nike', 2300000, 'Footwear', 'Men', 'Sneaker', 'Black/White', 'Retro', '/images/products/nike_dunk_retro_panda_1.jpg'),
('PD0003', 'Adidas Samba OG', 'Adidas', 1900000, 'Footwear', 'Men', 'Sneaker', 'Black/White', 'Vintage', '/images/products/adidas-samba-og.jpg'),
('PD0004', 'Nike Sportswear Club Woven Short-Sleeve Button-Up', 'Nike', 890000, 'Clothes', 'Men', 'Shirt', 'Black', 'Casual', '/images/products/nike-button-up.jpg'),
('PD0005', 'Nike Sportswear Club T-Shirt SS25', 'Nike', 550000, 'Clothes', 'Men', 'T-Shirt', 'White', 'Basic', '/images/products/nike-tshirt-ss25.jpg'),
('PD0006', 'Nike Killshot 2 Leather', 'Nike', 1700000, 'Footwear', 'Men', 'Sneaker', 'White/Green', 'Tennis', '/images/products/nike-killshot-2.jpg');

-- Insert product details
INSERT INTO product_details ("productId", detail) VALUES
('PD0001', 'An iconic and highly versatile sneaker.'),
('PD0001', 'Classic silhouette rooted in basketball heritage.'),
('PD0001', 'Making it a staple for everyday style and various outfits.'),
('PD0002', 'The immensely popular "Panda" colorway of the Dunk Low.'),
('PD0002', 'Timeless black and white contrast that is easy to pair with any look.'),
('PD0002', 'A must-have for sneaker enthusiasts.'),
('PD0003', 'A true classic with timeless, low-profile design.'),
('PD0003', 'Signature T-toe overlay and gum sole.'),
('PD0003', 'Transitioning effortlessly from football pitches to urban streets.'),
('PD0004', 'Comfortable and lightweight short-sleeve button-up.'),
('PD0004', 'Offers a relaxed fit and a clean, versatile look.'),
('PD0004', 'Perfect for casual outings or layering during warmer weather.'),
('PD0005', 'Your go-to essential for everyday comfort and classic style.'),
('PD0005', 'From the Spring/Summer 2025 collection.'),
('PD0005', 'Features soft fabric and the iconic Nike logo for a timeless athletic look.'),
('PD0006', 'A fan-favorite with clean, retro tennis-inspired aesthetic.'),
('PD0006', 'Premium leather construction.'),
('PD0006', 'Gum rubber sole for enduring style and comfort.');

-- Insert product gallery images
INSERT INTO product_images ("productId", "imageUrl") VALUES
('PD0001', '/images/products/nike-dunk-low.jpg'),
('PD0001', '/images/products/nike-dunk-low-2.jpg'),
('PD0002', '/images/products/nike_dunk_retro_panda_1.jpg'),
('PD0002', '/images/products/nike_dunk_retro_panda_2.jpg'),
('PD0002', '/images/products/nike_dunk_retro_panda_3.jpg'),
('PD0003', '/images/products/adidas-samba-og.jpg'),
('PD0003', '/images/products/adidas-samba-og-2.jpg'),
('PD0004', '/images/products/nike-button-up.jpg'),
('PD0004', '/images/products/nike-button-up-2.jpg'),
('PD0005', '/images/products/nike-tshirt-ss25.jpg'),
('PD0005', '/images/products/nike-tshirt-ss25-2.jpg'),
('PD0006', '/images/products/nike-killshot-2.jpg'),
('PD0006', '/images/products/nike-killshot-2-2.jpg');

-- Insert product sizes
INSERT INTO product_sizes ("productId", size) VALUES
('PD0001', '38'),
('PD0001', '39'),
('PD0001', '40'),
('PD0001', '41'),
('PD0001', '42'),
('PD0001', '43'),
('PD0001', '44'),
('PD0002', '38'),
('PD0002', '39'),
('PD0002', '40'),
('PD0002', '41'),
('PD0002', '42'),
('PD0002', '43'),
('PD0003', '38'),
('PD0003', '39'),
('PD0003', '40'),
('PD0003', '41'),
('PD0003', '42'),
('PD0003', '43'),
('PD0003', '44'),
('PD0003', '45'),
('PD0004', 'S'),
('PD0004', 'M'),
('PD0004', 'L'),
('PD0004', 'XL'),
('PD0005', 'XS'),
('PD0005', 'S'),
('PD0005', 'M'),
('PD0005', 'L'),
('PD0005', 'XL'),
('PD0005', 'XXL'),
('PD0006', '38'),
('PD0006', '39'),
('PD0006', '40'),
('PD0006', '41'),
('PD0006', '42'),
('PD0006', '43'),
('PD0006', '44'),
('PD0006', '45');

-- Insert admin account
INSERT INTO admins (username, password) VALUES
('admin', '$2a$12$FAW0s2MJeK6mFr4QR7Re5uyYXQTLGiHJKqkYRpPQnGnmKPYpNI/Be');