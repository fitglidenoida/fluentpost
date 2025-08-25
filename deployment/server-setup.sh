#!/bin/bash

# FluentPost.in Server Setup Script
# Run this on your VPS as root

echo "🚀 Setting up FluentPost.in server..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y nginx certbot python3-certbot-nginx nodejs npm git curl wget unzip

# Install Node.js 18 (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application directory
mkdir -p /home/fluentpost
cd /home/fluentpost

# Set up Nginx configuration
cat > /etc/nginx/sites-available/fluentpost << 'EOF'
# Main domain
server {
    listen 80;
    server_name fluentpost.in www.fluentpost.in;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS main domain
server {
    listen 443 ssl http2;
    server_name fluentpost.in www.fluentpost.in;
    
    # SSL configuration will be added by certbot
    
    root /home/fluentpost/public;
    index index.html;
    
    # Marketing site
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# App subdomain
server {
    listen 80;
    server_name app.fluentpost.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.fluentpost.in;
    
    # SSL configuration will be added by certbot
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wildcard subdomain for customers
server {
    listen 80;
    server_name ~^(?<customer>.+)\.fluentpost\.in$;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ~^(?<customer>.+)\.fluentpost\.in$;
    
    # SSL configuration will be added by certbot
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Customer $customer;
        proxy_cache_bypass $http_upgrade;
    }
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/fluentpost /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx

echo "✅ Server setup completed!"
echo "📝 Next steps:"
echo "1. Wait for DNS propagation"
echo "2. Run: certbot --nginx -d fluentpost.in -d www.fluentpost.in -d app.fluentpost.in"
echo "3. Clone repository: git clone https://github.com/fitglidenoida/fluentpost.git"
echo "3. Deploy your application"
EOF
