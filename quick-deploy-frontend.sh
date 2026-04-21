#!/bin/bash

# Quick Frontend Deployment Script
# Use this to quickly rebuild and deploy frontend changes

set -e

echo "🎨 Quick Frontend Deployment..."

cd frontend

# Build production bundle with production env
echo "🏗️  Building production bundle..."
npm run build

# Copy build to web server directory
echo "📋 Copying build files to server..."
sudo rm -rf /var/www/healthmarketarena/html/*
sudo cp -r build/* /var/www/healthmarketarena/html/

echo "✅ Frontend deployment completed!"
echo "🌐 Visit: https://healthmarketarena.com/forgot-password"
