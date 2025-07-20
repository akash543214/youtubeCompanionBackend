# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies first (only package files to use Docker layer cache)
COPY package*.json ./
RUN npm install

# Optional: install nodemon globally (if not already in package.json)
RUN npm install -g nodemon

# Copy source code (for production; will be overridden in dev by volume)
COPY . .

# Expose app port
EXPOSE 3000

# Start with dev script using nodemon + ts-node
CMD ["npm", "run", "dev"]
