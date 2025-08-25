#!/bin/bash

# Push to GitHub Script
# Run this locally to push changes to GitHub

echo "🚀 Pushing to GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git remote add origin https://github.com/fitglidenoida/fluentpost.git
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update deployment scripts and multi-tenancy support"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Repository: https://github.com/fitglidenoida/fluentpost"
