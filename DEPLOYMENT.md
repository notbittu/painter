# Deployment Guide for Paint Home

This guide provides instructions for deploying the Paint Home application, a React-based app with Express for static file serving. This application can be deployed on virtually any platform that supports Node.js.

## Prerequisites

- Node.js 14+ (16+ recommended)
- npm 7+ or yarn
- Git

## Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd painter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the frontend:
   ```
   npm run build
   ```

4. Run the application:
   ```
   npm start
   ```

   For development with hot reloading:
   ```
   npm run dev
   ```

## Deployment Options

### Option 1: Deploy with Docker

1. Build the Docker image:
   ```
   docker build -t paint-home .
   ```

2. Run the Docker container:
   ```
   docker run -p 3000:3000 paint-home
   ```

   For detached mode:
   ```
   docker run -d -p 3000:3000 paint-home
   ```

### Option 2: Deploy to Heroku

1. Install the Heroku CLI and log in:
   ```
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

3. Push to Heroku:
   ```
   git push heroku main
   ```

4. Open the app:
   ```
   heroku open
   ```

### Option 3: Deploy to Vercel or Netlify

#### Vercel
1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Deploy:
   ```
   vercel
   ```

#### Netlify
1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Deploy:
   ```
   netlify deploy
   ```

### Option 4: Deploy to AWS

#### Using Elastic Beanstalk

1. Install the AWS CLI and EB CLI:
   ```
   pip install awscli
   pip install awsebcli
   ```

2. Configure AWS credentials:
   ```
   aws configure
   ```

3. Initialize EB app:
   ```
   eb init
   ```

4. Create environment and deploy:
   ```
   eb create
   ```

#### Using EC2

1. Launch an EC2 instance with Amazon Linux 2
2. Connect to your instance:
   ```
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. Install Node.js:
   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   source ~/.bashrc
   nvm install 16
   ```

4. Clone your repository and deploy:
   ```
   git clone <your-repo-url>
   cd painter
   npm install
   npm run build
   npm start
   ```

5. Use PM2 to keep your app running:
   ```
   npm install -g pm2
   pm2 start server.js --name "paint-home"
   pm2 startup
   pm2 save
   ```

### Option 5: Manual Deploy to Any VPS

1. SSH into your server:
   ```
   ssh user@your-server
   ```

2. Install Node.js (if not already installed)

3. Clone the repository and navigate to the project directory:
   ```
   git clone <repository-url>
   cd painter
   ```

4. Run the build script:
   ```
   chmod +x build.sh
   ./build.sh
   ```

5. Use a process manager to keep your application running:
   ```
   npm install -g pm2
   pm2 start server.js --name "paint-home"
   pm2 startup
   pm2 save
   ```

6. Set up a reverse proxy with Nginx:
   ```
   # Install Nginx
   sudo apt update
   sudo apt install nginx

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/paint-home
   ```

   Add this configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:
   ```
   sudo ln -s /etc/nginx/sites-available/paint-home /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Set up SSL with Let's Encrypt:
   ```
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Project Structure

```
painter/
├── client/               # React frontend
│   ├── build/            # Built frontend files
│   ├── public/           # Public assets
│   └── src/              # React source code
├── server.js             # Express server
├── package.json          # Node.js dependencies
├── Dockerfile            # Docker configuration
└── build.sh              # Build script
```

## Troubleshooting

- If static files aren't being served correctly:
  - Ensure the build directory exists at `client/build`
  - Verify that express-static-gzip is correctly configured in `server.js`
  - Check file permissions on the client/build directory

- If the app fails to start:
  ```
  # Check logs
  npm logs
  
  # For PM2
  pm2 logs paint-home
  
  # For Heroku
  heroku logs --tail
  ```

- For React build issues:
  ```
  cd client
  rm -rf node_modules
  npm install
  npm run build
  ```

## Performance Optimization

1. The app uses advanced compression techniques with express-static-gzip
2. Assets are properly cached using cache headers
3. React build is optimized for production
4. Images and fonts are preloaded for better performance

## Additional Resources

- [Express Documentation](https://expressjs.com/)
- [express-static-gzip Documentation](https://www.npmjs.com/package/express-static-gzip)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/) 