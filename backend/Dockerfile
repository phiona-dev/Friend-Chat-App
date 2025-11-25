FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package-lock if present)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Ensure uploads exist for static files
RUN mkdir -p uploads || true

ENV PORT=5000
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
