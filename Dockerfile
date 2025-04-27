FROM node:18-slim

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g serve

# Copy the rest of the application
COPY . .

# Build if needed
RUN if [ -f "package.json" ] && grep -q "build" "package.json"; then npm run build; fi

# Expose port
EXPOSE 3000

# Start command
CMD ["serve", "-s", "client/build", "-l", "3000"] 