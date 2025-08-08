FROM node:18-alpine

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ .

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
