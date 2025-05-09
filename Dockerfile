FROM node:20-alpine AS builder

# Install necessary dependencies, including openssl
RUN apk add --no-cache openssl

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client (make sure Prisma is installed)
RUN npx prisma generate

RUN npx prisma db push

# Expose the port for the app (optional, change based on your app setup)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
