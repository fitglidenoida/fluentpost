#!/bin/bash

# Nginx Setup Script for FluentPost
# Run this after deploying the application

set -e

echo "🔧 Setting up Nginx for FluentPost..."

# Copy Nginx configuration
echo "📝 Copying Nginx configuration..."
cp deployment/nginx-fluentpost.conf /etc/nginx/sites-available/fluentpost

# Enable the site
echo "🔗 Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/fluentpost /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx setup completed!"
echo "🌐 Your app should be available at: https://fluentpost.in"
echo "📝 Check logs with: tail -f /var/log/nginx/fluentpost.in.error.log"
