# Build stage for the React frontend
FROM node:18-alpine as build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Production stage
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories first
RUN mkdir -p /app/static/client/build

# Copy the built React app
COPY --from=build /app/client/build/ /app/static/client/build/

# Copy the Python application
COPY app.py .
COPY utils/ ./utils/

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Run the application
CMD ["python", "app.py"] 