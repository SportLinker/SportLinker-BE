FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install node dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port for the app (optional, change based on your app setup)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
