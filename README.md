# Painter

A modern web application for drawing on photos built with React and Flask.

## Features

- **Take Photos**: Capture images with your device camera
- **Upload Images**: Use existing photos from your device
- **Drawing Tools**: Draw on your images with customizable brush size and colors
- **Eraser**: Remove parts of your drawing
- **Undo & Clear**: Easily fix mistakes or start over
- **Fullscreen Mode**: Immersive editing experience
- **Save & Download**: Save your creations to your device
- **Mobile Friendly**: Works on phones, tablets and desktop

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material UI for components
- React Router for navigation
- React Konva for canvas drawing
- React Webcam for camera access
- Error boundaries for graceful error handling
- Code splitting with lazy loading

### Backend
- Python Flask
- WhiteNoise for static file serving
- Flask-CORS for cross-origin support
- Logging for debugging and monitoring

## Project Structure

```
painter/
├── client/          # React frontend
│   ├── build/       # Built frontend files
│   ├── public/      # Static assets
│   └── src/         # Source code
│       ├── components/  # Reusable UI components
│       ├── context/     # React contexts
│       ├── pages/       # Page components
│       ├── types/       # TypeScript types
│       └── utils/       # Helper functions
├── app.py           # Flask backend
├── Procfile         # Deployment configuration
└── requirements.txt # Python dependencies
```

## Setup & Development

### Prerequisites

- Node.js 18+
- Python 3.9+
- pip

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

### Running the Application

```bash
# Start backend server (from project root)
python app.py

# In another terminal, start frontend
cd client
npm start
```

## Deployment

The application is configured for deployment on Render.com. Pushing to the connected GitHub repository will automatically trigger a deployment.

### Manual Deployment Steps

1. Build the React frontend:
   ```bash
   cd client
   npm run build
   ```

2. Copy the build files to the static directory:
   ```bash
   mkdir -p ../static/client
   cp -r build ../static/client/
   ```

3. Deploy the Flask app with the prebuilt frontend files.

## Alternative Deployment Options

### Vercel (Fast Deployment)

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy the project:
```bash
vercel
```

3. For production deployment:
```bash
vercel --prod
```

### Netlify (Fast Deployment)

1. Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy the frontend:
```bash
cd client
netlify deploy
```

3. For production deployment:
```bash
netlify deploy --prod
```

### Railway (Fast Backend)

1. Install the Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

### Splitting Frontend and Backend

For optimal performance, you can split the deployment:
1. Deploy the frontend to Vercel or Netlify
2. Deploy the backend to Railway or Fly.io
3. Update the API URL in the frontend environment variables

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/detect-colors` - Detect colors in an image
- `POST /api/save-image` - Save an image (placeholder functionality)

## License

MIT

## Credits

Created by [your name/organization]