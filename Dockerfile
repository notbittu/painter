# Build stage for the React frontend
FROM node:18-alpine as build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the built React app
COPY --from=build /app/client/build /app/build

# Expose the port
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "build", "-l", "3000"] 