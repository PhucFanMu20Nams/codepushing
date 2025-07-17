# Use Node.js LTS version
FROM node:18-alpine

# Install MongoDB tools for healthcheck
RUN apk add --no-cache mongodb-tools

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create directory for uploads if it doesn't exist
RUN mkdir -p images/products

# Expose the port your app runs on
EXPOSE 5000

# Start the application with setup
CMD ["npm", "run", "setup-and-run"]
