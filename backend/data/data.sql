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
INSERT INTO products (id, name, brand, price, category, subcategory, type, image) VALUES 
('nike-dunk-low', 'Nike Dunk Low', 'Nike', 1800000, 'Footwear', 'Men', 'Sneaker', '/images/products/nike-dunk-low.jpg'),
('nike-dunk-low-panda', 'Nike Dunk Low Retro Panda', 'Nike', 2300000, 'Footwear', 'Men', 'Sneaker', '/images/products/nike_dunk_retro_panda_1.jpg'),
('adidas-samba-og', 'Adidas Samba OG', 'Adidas', 1900000, 'Footwear', 'Men', 'Sneaker', '/images/products/adidas-samba-og.jpg'),
('nike-sportswear-club-button-up', 'Nike Sportswear Club Woven Short-Sleeve Button-Up', 'Nike', 890000, 'Clothes', 'Men', 'Shirt', '/images/products/nike-button-up.jpg'),
('nike-sportswear-club-tshirt-ss25', 'Nike Sportswear Club T-Shirt SS25', 'Nike', 550000, 'Clothes', 'Men', 'T-Shirt', '/images/products/nike-tshirt-ss25.jpg'),
('nike-killshot-2-leather', 'Nike Killshot 2 Leather', 'Nike', 1700000, 'Footwear', 'Men', 'Sneaker', '/images/products/nike-killshot-2.jpg');

-- Insert product details
INSERT INTO product_details ("productId", detail) VALUES
('nike-dunk-low', 'An iconic and highly versatile sneaker.'),
('nike-dunk-low', 'Classic silhouette rooted in basketball heritage.'),
('nike-dunk-low', 'Making it a staple for everyday style and various outfits.'),
('nike-dunk-low-panda', 'The immensely popular "Panda" colorway of the Dunk Low.'),
('nike-dunk-low-panda', 'Timeless black and white contrast that is easy to pair with any look.'),
('nike-dunk-low-panda', 'A must-have for sneaker enthusiasts.'),
('adidas-samba-og', 'A true classic with timeless, low-profile design.'),
('adidas-samba-og', 'Signature T-toe overlay and gum sole.'),
('adidas-samba-og', 'Transitioning effortlessly from football pitches to urban streets.'),
('nike-sportswear-club-button-up', 'Comfortable and lightweight short-sleeve button-up.'),
('nike-sportswear-club-button-up', 'Offers a relaxed fit and a clean, versatile look.'),
('nike-sportswear-club-button-up', 'Perfect for casual outings or layering during warmer weather.'),
('nike-sportswear-club-tshirt-ss25', 'Your go-to essential for everyday comfort and classic style.'),
('nike-sportswear-club-tshirt-ss25', 'From the Spring/Summer 2025 collection.'),
('nike-sportswear-club-tshirt-ss25', 'Features soft fabric and the iconic Nike logo for a timeless athletic look.'),
('nike-killshot-2-leather', 'A fan-favorite with clean, retro tennis-inspired aesthetic.'),
('nike-killshot-2-leather', 'Premium leather construction.'),
('nike-killshot-2-leather', 'Gum rubber sole for enduring style and comfort.');

-- Insert product gallery images
INSERT INTO product_images ("productId", "imageUrl") VALUES
('nike-dunk-low', '/images/products/nike-dunk-low.jpg'),
('nike-dunk-low', '/images/products/nike-dunk-low-2.jpg'),
('nike-dunk-low-panda', '/images/products/nike_dunk_retro_panda_1.jpg'),
('nike-dunk-low-panda', '/images/products/nike_dunk_retro_panda_2.jpg'),
('nike-dunk-low-panda', '/images/products/nike_dunk_retro_panda_3.jpg'),
('adidas-samba-og', '/images/products/adidas-samba-og.jpg'),
('adidas-samba-og', '/images/products/adidas-samba-og-2.jpg'),
('nike-sportswear-club-button-up', '/images/products/nike-button-up.jpg'),
('nike-sportswear-club-button-up', '/images/products/nike-button-up-2.jpg'),
('nike-sportswear-club-tshirt-ss25', '/images/products/nike-tshirt-ss25.jpg'),
('nike-sportswear-club-tshirt-ss25', '/images/products/nike-tshirt-ss25-2.jpg'),
('nike-killshot-2-leather', '/images/products/nike-killshot-2.jpg'),
('nike-killshot-2-leather', '/images/products/nike-killshot-2-2.jpg');

-- Insert product sizes
INSERT INTO product_sizes ("productId", size) VALUES
('nike-dunk-low', '38'),
('nike-dunk-low', '39'),
('nike-dunk-low', '40'),
('nike-dunk-low', '41'),
('nike-dunk-low', '42'),
('nike-dunk-low', '43'),
('nike-dunk-low', '44'),
('nike-dunk-low-panda', '38'),
('nike-dunk-low-panda', '39'),
('nike-dunk-low-panda', '40'),
('nike-dunk-low-panda', '41'),
('nike-dunk-low-panda', '42'),
('nike-dunk-low-panda', '43'),
('adidas-samba-og', '38'),
('adidas-samba-og', '39'),
('adidas-samba-og', '40'),
('adidas-samba-og', '41'),
('adidas-samba-og', '42'),
('adidas-samba-og', '43'),
('adidas-samba-og', '44'),
('adidas-samba-og', '45'),
('nike-sportswear-club-button-up', 'S'),
('nike-sportswear-club-button-up', 'M'),
('nike-sportswear-club-button-up', 'L'),
('nike-sportswear-club-button-up', 'XL'),
('nike-sportswear-club-tshirt-ss25', 'XS'),
('nike-sportswear-club-tshirt-ss25', 'S'),
('nike-sportswear-club-tshirt-ss25', 'M'),
('nike-sportswear-club-tshirt-ss25', 'L'),
('nike-sportswear-club-tshirt-ss25', 'XL'),
('nike-sportswear-club-tshirt-ss25', 'XXL'),
('nike-killshot-2-leather', '38'),
('nike-killshot-2-leather', '39'),
('nike-killshot-2-leather', '40'),
('nike-killshot-2-leather', '41'),
('nike-killshot-2-leather', '42'),
('nike-killshot-2-leather', '43'),
('nike-killshot-2-leather', '44'),
('nike-killshot-2-leather', '45');

-- Insert admin account
INSERT INTO admins (username, password) VALUES
('admin', '$2a$12$FAW0s2MJeK6mFr4QR7Re5uyYXQTLGiHJKqkYRpPQnGnmKPYpNI/Be');