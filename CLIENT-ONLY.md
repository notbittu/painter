# Pure React Deployment

This application has been configured to run as a pure React web application without any backend dependencies.

## Project Structure

- `client/`: React frontend application
- `nginx.conf`: Configuration for serving the static files in production

## Local Development

1. Install dependencies and start the development server:
   ```
   cd client
   npm install
   npm start
   ```

## Deployment

The application can be deployed using:

1. Docker:
   ```
   docker build -t paint-home .
   docker run -p 80:80 paint-home
   ```

2. Static hosting (Vercel, Netlify, GitHub Pages, etc.):
   - Build the client: `cd client && npm run build`
   - Deploy the `client/build` directory

## Notes

- This is a pure React application with no backend
- All functionality is client-side only
- The application can be hosted on any static file hosting service 