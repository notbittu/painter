# Build stage for the React frontend
FROM node:18-alpine as build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create the static directory structure
RUN mkdir -p /app/static/client/build

# Copy the built React app to the static directory
COPY --from=build /app/client/build/ /app/static/client/build/

# Verify the files were copied
RUN if [ -f "/app/static/client/build/index.html" ]; then \
        echo "Build files copied successfully"; \
    else \
        echo "Build files not found in static directory"; \
        exit 1; \
    fi

# Install serve globally
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "static/client/build", "-l", "3000"] 