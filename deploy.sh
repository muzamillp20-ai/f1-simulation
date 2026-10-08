#!/bin/bash

# F1 Racing Game - Quick Deploy Script
# This script builds and prepares the project for GitHub Pages deployment

echo "🏎️ F1 Nitro Racing - Deployment Script"
echo "======================================"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📂 Build output:"
    ls -lh dist/
    echo ""
    echo "🚀 Next steps:"
    echo "1. Review your changes: git status"
    echo "2. Add files: git add ."
    echo "3. Commit: git commit -m 'Your commit message'"
    echo "4. Push: git push origin main"
    echo ""
    echo "🌐 Your site will be deployed automatically to:"
    echo "   https://YOUR_USERNAME.github.io/f1-racing-game/"
    echo ""
    echo "⚠️  Remember to:"
    echo "   - Update base path in vite.config.js if your repo name differs"
    echo "   - Enable GitHub Pages in repository settings (Source: GitHub Actions)"
    echo "   - Make sure repository is Public"
else
    echo "❌ Build failed! Please check for errors."
    exit 1
fi
