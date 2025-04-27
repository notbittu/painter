# Build stage for the React frontend
FROM node:18-alpine as build

WORKDIR /app
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Set up nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create required directories for logs
RUN mkdir -p /var/log/nginx

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
