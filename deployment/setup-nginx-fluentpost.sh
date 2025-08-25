#!/bin/bash

# Simple Nginx setup for FluentPost
# Run this on your VPS as root

set -e

echo "🌐 Setting up Nginx for FluentPost..."

# Copy the Nginx configuration
cp deployment/nginx-fluentpost-simple.conf /etc/nginx/sites-available/fluentpost

# Enable the site
ln -sf /etc/nginx/sites-available/fluentpost /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx setup completed!"
echo "📝 Your FluentPost app should now be accessible at:"
echo "   http://fluentpost.in"
echo "   http://www.fluentpost.in"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your app is running on port 3002 with PM2"
echo "2. Set up SSL: certbot --nginx -d fluentpost.in -d www.fluentpost.in"
