#!/bin/bash

echo "🚀 Starting Textura Application with Docker..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until mongosh --host mongodb:27017 --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "⏳ MongoDB is unavailable - sleeping"
  sleep 2
done

echo "✅ MongoDB is ready!"

# Initialize the application
echo "🔧 Initializing categories and database..."
npm run setup-and-run

echo "🎉 Application is ready!"
