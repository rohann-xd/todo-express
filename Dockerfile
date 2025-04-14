# Use the official Node.js LTS image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (match the port in server.js, usually 3000)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
