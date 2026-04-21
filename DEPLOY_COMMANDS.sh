#!/bin/bash

# Marketplace Health - Deployment Commands
# Date: April 19, 2026

echo "🚀 Starting Deployment Process..."
echo ""

# Step 1: Git Commit and Push
echo "📦 Step 1: Committing changes to Git..."
git add .
git commit -m "feat: Add patient subscription system and gym-physio integration

- Implement 3-tier subscription system (monthly, 6-months, yearly)
- Add subscription validation middleware for booking protection
- Create subscription management API (8 endpoints)
- Add subscription status to patient dashboard
- Integrate gym-physio user type with complete dashboard
- Add gym-physio to admin management
- Update login to support gym-physio authentication
- Fix patient registration routes

Features:
- Patients must subscribe to book appointments/emergency
- Subscription plans: ₦1,000/month, ₦4,000/6-months, ₦8,000/year
- Dashboard shows subscription status with days remaining
- Gym-physio providers can register and manage services
- Admin can manage gym-physio providers"

echo "✅ Changes committed"
echo ""

echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Pushed to GitHub"
echo ""

# Step 2: Deploy to Server (uncomment and modify for your server)
# echo "🌐 Step 2: Deploying to live server..."
# ssh user@your-server-ip << 'ENDSSH'
#   cd /path/to/marketplacehealth
#   git pull origin main
#   
#   # Backend
#   cd backend-nodejs
#   npm install
#   
#   # Frontend
#   cd ../frontend
#   npm install
#   npm run build
#   
#   # Restart services
#   pm2 restart all
#   pm2 status
# ENDSSH
# echo "✅ Deployed to live server"
# echo ""

echo "🎉 Deployment process complete!"
echo ""
echo "📋 Next steps:"
echo "1. SSH into your server"
echo "2. Pull the latest changes: git pull origin main"
echo "3. Install dependencies: npm install (in both backend and frontend)"
echo "4. Build frontend: npm run build"
echo "5. Restart PM2: pm2 restart all"
echo "6. Check logs: pm2 logs"
echo ""
echo "✅ All systems ready!"
