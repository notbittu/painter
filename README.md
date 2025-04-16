# Paint Home - AI-Powered Wall Color Visualization

Paint Home is a web application that helps users visualize how different paint colors will look on their walls using AI-powered color extraction and visualization techniques.

## Features

- **Image Upload**: Upload or capture a photo of your wall directly from your device
- **AI Color Suggestions**: Get intelligent color recommendations based on your uploaded image
- **Color Palette**: Choose from a curated selection of paint colors
- **Complementary Colors**: View algorithmically generated complementary colors
- **Realistic Preview**: See how selected colors will look on your wall with realistic shading and lighting simulation
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: ReactJS with Material UI
- **Backend**: Python Flask API
- **Computer Vision**: OpenCV
- **Image Processing**: Pillow, NumPy
- **Deployment**: Render.com

## Project Structure

```
.
├── app.py                  # Main entry point for Render.com
├── Procfile                # Render.com deployment config
├── requirements.txt        # Python dependencies
├── client/                 # React frontend
│   ├── public/             # Public assets
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── App.js          # Main React component
│   │   └── index.js        # React entry point
│   └── build/              # Production build output
└── server/                 # Flask backend
    ├── app.py              # Flask application
    ├── uploads/            # User uploaded images
    └── utils/              # Utility modules
        └── ai_color.py     # AI color extraction and application
```

## Development Setup

### Backend

1. Create a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask server
   ```
   python app.py
   ```

### Frontend

1. Navigate to the client directory
   ```
   cd client
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

## Deployment

This application is designed to be easily deployed to [Render.com](https://render.com) through these steps:

1. Push the code to GitHub
2. Connect Render to your GitHub repository
3. Create a new Web Service on Render with the following settings:
   - Build Command: `pip install -r requirements.txt && cd client && npm install && npm run build`
   - Start Command: `gunicorn app:application`

## How It Works

1. **Image Upload**: Users upload a wall image through the web interface
2. **Color Extraction**: The system extracts dominant colors from the image
3. **Color Selection**: Users can choose from AI-suggested colors, predefined palettes, or complementary colors
4. **Color Application**: The selected color is applied to the wall with edge detection for realistic shading
5. **Visualization**: Users can toggle between original and colored views to compare the results

## License

MIT