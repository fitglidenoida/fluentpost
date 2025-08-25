#!/bin/bash

# FluentPost.in Deployment Script
# Run this on your VPS

echo "🚀 Deploying FluentPost.in..."

# Set variables
APP_DIR="/home/fluentpost"
BACKUP_DIR="/home/fluentpost/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup current version (if exists)
if [ -d "$APP_DIR" ]; then
    echo "📦 Creating backup..."
    tar -czf "$BACKUP_DIR/fluentpost_backup_$TIMESTAMP.tar.gz" -C /home fluentpost
fi

# Create application directory
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or pull latest code
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/fitglidenoida/fluentpost.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cp deployment/env.production.example .env.local

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fluentpost',
    script: 'npm',
    args: 'start',
    cwd: '/home/fluentpost',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/fluentpost/error.log',
    out_file: '/var/log/fluentpost/out.log',
    log_file: '/var/log/fluentpost/combined.log',
    time: true
  }]
}
EOF

# Create log directory
mkdir -p /var/log/fluentpost

# Set permissions
chown -R fluentpost:fluentpost $APP_DIR
chmod -R 755 $APP_DIR

# Start/restart application with PM2
echo "🚀 Starting application..."
pm2 delete fluentpost 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Deployment completed!"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs fluentpost"
echo "🌐 Your app should be available at: https://app.fluentpost.in"
