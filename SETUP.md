# Paint Home Setup Guide

This guide will help you set up and run the Paint Home application on your local machine.

## Prerequisites

- Python 3.8+ installed on your machine
- Pip package manager

## Installation Steps

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd painter
   ```

2. **Install dependencies**
   ```
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```
   python app.py
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## Using the Application

1. **Upload an image**
   - Click on "Choose File" or drag and drop an image of your wall
   - Alternatively, use the "Take Photo" option to capture a live photo (requires camera permission)

2. **Select a color**
   - The app will automatically extract suggested colors from your image
   - You can choose from:
     - AI Suggested colors (based on your image)
     - Color Palette (predefined paint colors)
     - Complementary Colors (colors that work well together)

3. **Apply and visualize**
   - Click "Apply to Wall" to see how the selected color looks on your wall
   - Toggle between "Original" and "Colored" views to compare

## Troubleshooting

- **Image upload issues**: Ensure your image is in JPG, JPEG, or PNG format and less than 16MB
- **Camera not working**: Make sure you've granted camera permissions to your browser
- **Colors not applying**: Try a different browser if you encounter issues

## Deployment to Render.com

1. **Push your code to GitHub**

2. **On Render.com**:
   - Sign in to your Render account
   - Create a new Web Service
   - Connect your GitHub repository
   - Configure the settings:
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `gunicorn app:app`
   - Click "Create Web Service"

3. **Environment Variables** (if needed):
   - Set `PYTHON_VERSION=3.9` in the Environment Variables section

For any additional help, please refer to the [Render.com documentation](https://render.com/docs). 