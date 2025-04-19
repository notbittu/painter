# Painter App

A modern web application built with React and Flask.

## Project Structure

```
painter/
├── client/          # React frontend
├── app.py          # Flask backend
├── Procfile        # Deployment configuration
└── requirements.txt # Python dependencies
```

## Setup

1. **Backend Setup**
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

2. **Frontend Setup**
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

3. **Running the Application**
```bash
# Start backend server
python app.py

# In another terminal, start frontend
cd client
npm start
```

## Deployment

The application is configured for deployment on Render.com. Just push to GitHub and Render will:
1. Install dependencies
2. Build the React app
3. Serve the application using Gunicorn

## Features

- Modern React frontend
- Efficient static file serving with WhiteNoise
- Easy deployment configuration

## Technologies Used

- **Frontend**: ReactJS with Material UI
- **Backend**: Python Flask API
- **Computer Vision**: OpenCV
- **Image Processing**: Pillow, NumPy

## How It Works

1. **Image Upload**: Users upload a wall image through the web interface
2. **Color Extraction**: The system extracts dominant colors from the image
3. **Color Selection**: Users can choose from AI-suggested colors, predefined palettes, or complementary colors
4. **Color Application**: The selected color is applied to the wall with edge detection for realistic shading
5. **Visualization**: Users can toggle between original and colored views to compare the results

## License

MIT