# Textura API Authentication Guide

This guide explains how to set up and use the authentication system for the Textura e-commerce platform.

## Initial Setup

1. Copy the example environment file and configure it:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and set secure values for:
   - `JWT_SECRET`
   - `DB_PASSWORD`

3. Create the admin user:
   ```
   npm run create-admin
   ```
   **IMPORTANT**: Before running this command, edit the `scripts/create-admin.js` file and change the default admin credentials!

## Authentication Endpoints

### Register Admin (First-time Setup Only)
```
POST /api/auth/register
```
Body:
```json
{
  "username": "admin",
  "email": "admin@textura.com",
  "password": "secure_password"
}
```

### Login
```
POST /api/auth/login
```
Body:
```json
{
  "username": "admin",
  "email": "admin@textura.com",
  "password": "secure_password"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "your-jwt-token",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@textura.com",
      "lastLogin": "2025-07-01T12:00:00.000Z"
    }
  }
}
```

### Get Admin Profile
```
GET /api/auth/profile
```
Headers:
```
Authorization: Bearer your-jwt-token
```

## Using the Authentication Token

For all protected API endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Protected Endpoints

The following endpoints require authentication:

- `POST /api/products` - Create a product
- `PUT /api/products/:id` - Update a product
- `PATCH /api/products/:id` - Partially update a product 
- `DELETE /api/products/:id` - Delete a product
- `POST /api/products/upload` - Upload a product with images

## Security Notes

1. The token expires after 24 hours by default
2. Failed login attempts are rate-limited (5 attempts per 15 minutes)
3. Passwords are securely hashed using bcrypt
4. In production, ensure your JWT_SECRET is strong and secure
