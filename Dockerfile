FROM node:22

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Optimize npm settings and use npm ci for faster, more reliable installation
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 3 \
    && npm config set fetch-retry-factor 2 \
    && npm ci

# Copy the rest of the application
COPY . .

# Set the command to run the application
CMD ["npm", "start"]

# Expose the port your app runs on
EXPOSE 3000