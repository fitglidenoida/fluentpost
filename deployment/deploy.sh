#!/bin/bash

# FluentPost Deployment Script
# Updated for current server setup

set -e

# Configuration
APP_DIR="/home/fluentpost"
BACKUP_DIR="/home/fluentpost/backups"
GIT_REPO="https://github.com/fitglidenoida/fluentpost.git"
APP_NAME="fluentpost"

echo "🚀 Deploying FluentPost.in..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "📦 Creating backup..."
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    BACKUP_FILE="$BACKUP_DIR/${APP_NAME}_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$BACKUP_FILE" -C "$APP_DIR" .
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "ℹ️  No existing app to backup"
fi

# Navigate to app directory
cd "$APP_DIR"

# Clone or pull repository
echo "📥 Updating repository..."
if [ -d ".git" ]; then
    git pull origin main
    echo "✅ Repository updated"
else
    git clone "$GIT_REPO" .
    echo "✅ Repository cloned"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
echo "⚙️ Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    if [ -f "deployment/env.production.example" ]; then
        cp deployment/env.production.example .env.local
        echo "✅ Environment file created from template"
    else
        echo "⚠️  No environment template found, creating basic .env.local"
        cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="https://fluentpost.in"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-key-here"

# Social Media (configure these)
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_TOKEN_SECRET=""
FACEBOOK_ACCESS_TOKEN=""
INSTAGRAM_ACCESS_TOKEN=""

# Email
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# Facebook SDK
NEXT_PUBLIC_FACEBOOK_APP_ID=""
EOF
    fi
    echo "⚠️  Please configure .env.local with your actual values"
fi

# Build application
echo "🔨 Building application..."
npm run build

# Set proper permissions
echo "🔐 Setting permissions..."
chown -R fluentpost:fluentpost "$APP_DIR" 2>/dev/null || echo "⚠️  Could not change ownership (running as root)"

# Create PM2 ecosystem config
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'fluentpost',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '$APP_DIR',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0'
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/home/fluentpost/logs/err.log',
      out_file: '/home/fluentpost/logs/out.log',
      log_file: '/home/fluentpost/logs/combined.log',
      time: true
    }
  ]
}
EOF

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Start application
echo "🚀 Starting application..."
pm2 delete fluentpost 2>/dev/null || echo "ℹ️  No existing fluentpost process to delete"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root

echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Deployment completed!"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs fluentpost"
echo "🌐 Your app should be available at: https://fluentpost.in"
echo "🔧 Configure environment variables in: $APP_DIR/.env.local"
