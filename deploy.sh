#!/bin/bash
set -e

echo "🚀 One-Click Deployment: Netlify (Frontend) & Railway (Backend)"
echo "=============================================================="

# Check for required CLIs
command -v netlify >/dev/null 2>&1 || { echo "⚠️ Netlify CLI is required. Install with: npm install -g netlify-cli"; exit 1; }
command -v railway >/dev/null 2>&1 || { echo "⚠️ Railway CLI is required. Install with: npm install -g @railway/cli"; exit 1; }

# Ensure user is logged in to both platforms
echo "🔐 Ensuring you're logged into deployment platforms..."

# Check Netlify login status
if ! netlify status &>/dev/null; then
  echo "📝 Please log in to Netlify:"
  netlify login
fi

# Check Railway login status
if ! railway whoami &>/dev/null; then
  echo "📝 Please log in to Railway:"
  railway login
fi

# Prepare the project
echo "🔨 Preparing project for deployment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing server dependencies..."
  npm install
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd client && npm install && cd ..
fi

# Build the frontend
echo "🏗️ Building the React frontend..."
cd client && npm run build && cd ..

# Deploy backend to Railway
echo "🚂 Deploying backend to Railway..."
railway up

# Get the Railway deployed URL
RAILWAY_URL=$(railway service | grep "Public URL" | awk -F': ' '{print $2}')
echo "🌐 Railway backend URL: $RAILWAY_URL"

# Update the frontend environment with the backend URL
echo "⚙️ Configuring frontend environment..."
echo "REACT_APP_API_URL=$RAILWAY_URL" > client/.env.production

# Rebuild frontend with backend URL
echo "🏗️ Rebuilding frontend with backend configuration..."
cd client && npm run build && cd ..

# Deploy frontend to Netlify
echo "🌐 Deploying frontend to Netlify..."
cd client && netlify deploy --prod && cd ..

# Get the Netlify deployed URL
NETLIFY_URL=$(cd client && netlify open --url)

echo "✅ Deployment complete!"
echo "📱 Frontend: $NETLIFY_URL"
echo "⚙️ Backend: $RAILWAY_URL"
echo "🎉 Your Paint Home application is now live!" 