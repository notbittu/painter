# Client-Only Deployment

This application has been configured to run as a client-only web application without any Python backend dependencies.

## Project Structure

- `client/`: React frontend application
- `app.js`: Simple Express server to serve static files
- `Dockerfile`: Docker configuration for building and running the application

## Local Development

1. Install dependencies:
   ```
   npm install
   cd client && npm install
   ```

2. Build the client:
   ```
   npm run build
   ```

3. Start the server:
   ```
   npm start
   ```

## Deployment

The application can be deployed using:

1. Docker:
   ```
   docker build -t paint-home .
   docker run -p 3000:3000 paint-home
   ```

2. Vercel, Netlify, or any other static site hosting service:
   - Deploy the `client/build` directory as a static site

3. Traditional hosting:
   - Build the application and deploy the entire project
   - Run `npm start` to start the Express server

## Notes

- The application now runs without any Python dependencies
- All functionality is client-side only
- Static files are served from the `static/client/build` directory 