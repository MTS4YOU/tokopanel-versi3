#!/bin/bash

# Tokopanel V3 - Quick Deploy Guide
# Gunakan script ini untuk quick reference saat deploy

echo "🚀 Tokopanel V3 - Deployment Commands"
echo "======================================"
echo ""
echo "✅ Build Status: READY"
echo ""

# Development
echo "📍 Development:"
echo "  pnpm dev              # Jalankan di localhost:3000"
echo ""

# Production Build
echo "📍 Production Build:"
echo "  pnpm install          # Install dependencies"
echo "  pnpm build            # Build aplikasi"
echo "  pnpm type-check       # Verify TypeScript"
echo "  pnpm start            # Run production server (localhost:3000)"
echo ""

# Docker
echo "📍 Docker:"
echo "  docker build -t tokopanel-v3 ."
echo "  docker run -e MONGODB_URI=... -p 3000:3000 tokopanel-v3"
echo ""

# Vercel
echo "📍 Vercel (Recommended):"
echo "  1. Push ke GitHub"
echo "  2. https://vercel.com → New Project"
echo "  3. Import repo → Set env vars → Deploy"
echo ""

# Environment Setup
echo "📍 Environment Variables Setup:"
echo "  Required:"
echo "    MONGODB_URI=mongodb+srv://..."
echo "    MONGODB_DB_NAME=tokopanel_admin"
echo "    NODE_ENV=production"
echo ""
echo "  Optional (atau hardcoded di data/config.ts):"
echo "    - PTERODACTYL_DOMAIN"
echo "    - PTERODACTYL_API_KEY"
echo "    - EMAIL_* (SMTP)"
echo "    - PAYMENT_* (API credentials)"
echo "    - TELEGRAM_* (Bot)"
echo ""

# Verification
echo "📋 Verification:"
echo "  curl https://your-deployed-url.com/"
echo "  Expected: 200 OK"
echo ""

echo "📚 Documentation:"
echo "  - DEPLOY_READY.md           (Summary)"
echo "  - DEPLOYMENT_CHECKLIST.md   (Detailed guide)"
echo "  - .env.example              (Environment vars template)"
echo ""

echo "✨ App Version: 1.0.0"
echo "✨ Status: Production-Ready"
echo ""
