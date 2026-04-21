@echo off
REM Complete Deployment Script for Registration Flows Update (Windows)
REM This script commits, pushes, and deploys the updated registration flows

echo =========================================
echo Registration Flows Deployment Script
echo =========================================
echo.

REM Step 1: Check for uncommitted changes
echo Step 1: Checking for changes...
git status --short > temp.txt
set /p changes=<temp.txt
del temp.txt

if "%changes%"=="" (
    echo No changes to commit
) else (
    echo Changes detected, preparing to commit...
    echo.
    
    REM Step 2: Add all changes
    echo Step 2: Adding changes...
    git add .
    echo Changes added
    echo.
    
    REM Step 3: Commit changes
    echo Step 3: Committing changes...
    git commit -m "Standardize all registration flows to 2-step process - Convert Professional registration to 2-step flow - Convert Hospital registration to 2-step flow - Convert Ambulance registration to 2-step flow - Delete old multi-step registration files - Add TypeScript environment definitions - Update routes in App.tsx - All flows now use: Form to OTP Verify to Register to Login - Fix dashboard routing for all user types"
    echo Changes committed
    echo.
)

REM Step 4: Push to repository
echo Step 4: Push to repository
set /p push="Push to remote repository? (y/n): "
if /i "%push%"=="y" (
    git push origin main
    echo Pushed to repository
    echo.
) else (
    echo Skipped push
    echo.
)

echo =========================================
echo Deployment script completed!
echo =========================================
echo.
echo Next steps for VPS deployment:
echo 1. SSH into your VPS
echo 2. cd to your project directory
echo 3. Run: git pull origin main
echo 4. Run: cd frontend ^&^& npm run build
echo 5. Run: pm2 restart all
echo.
echo Then test all registration flows:
echo - Patient: https://healthmarketarena.com/register
echo - Professional: https://healthmarketarena.com/register/professional
echo - Hospital: https://healthmarketarena.com/register/hospital
echo - Ambulance: https://healthmarketarena.com/register/ambulance
echo - Gym-Physio: https://healthmarketarena.com/register/gym-physio
echo.
pause
