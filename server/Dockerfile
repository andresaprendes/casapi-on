FROM node:18-alpine

WORKDIR /app

# Install dependencies for sharp (image processing)
RUN apk add --no-cache vips-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY . .

# Create necessary directories
RUN mkdir -p public/images/products

# Make startup script executable
RUN chmod +x start.js

# Expose port
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/mercadopago/test', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the server with proper error handling
CMD ["node", "start.js"]
