# 🚀 GitHub Pages Deployment Guide

## ✅ What's Already Configured

Your F1 Racing game is **fully configured** for GitHub Pages deployment. Here's what's been set up:

### 1. Vite Configuration (`vite.config.js`)
- ✅ Base path set to `/f1-racing-game/`
- ✅ Build output configured for `dist/` folder
- ✅ Assets properly bundled

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- ✅ Automatic deployment on push to `main`
- ✅ Node.js 20 setup
- ✅ Dependency installation with `npm ci`
- ✅ Production build
- ✅ Deployment to GitHub Pages

### 3. Build Verification
- ✅ Production build successful
- ✅ All assets properly bundled
- ✅ Base path correctly applied to HTML, CSS, and JS

## 📋 Deployment Steps

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `f1-racing-game` (or your preferred name)
4. Make it **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 2: Update Base Path (If Needed)

If your repository name is different from `f1-racing-game`, update `vite.config.js`:

```javascript
base: '/your-repo-name/', // Replace with your actual repo name
```

Then rebuild:
```bash
npm run build
```

### Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: F1 Nitro Racing Game"

# Add remote (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/f1-racing-game.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically run and deploy your site

### Step 5: Verify Deployment

1. Go to **Actions** tab in your repository
2. You should see the workflow running
3. Wait for it to complete (usually 1-2 minutes)
4. Once done, your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/f1-racing-game/
   ```

## 🔍 Troubleshooting

### Blank Page After Deployment

**Problem**: Page loads but shows blank screen

**Solution**:
1. Check browser console for errors
2. Verify the base path in `vite.config.js` matches your repo name exactly
3. Rebuild and push:
   ```bash
   npm run build
   git add dist/
   git commit -m "Rebuild"
   git push
   ```

### Broken CSS/JS/Assets

**Problem**: Styles or scripts don't load

**Solution**:
1. Check the Network tab in browser DevTools
2. Verify asset paths include the repo name: `/f1-racing-game/assets/...`
3. Ensure `base` in `vite.config.js` is set correctly
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### 404 Errors

**Problem**: Assets return 404

**Solution**:
1. Verify the workflow completed successfully
2. Check that GitHub Pages source is set to "GitHub Actions"
3. Ensure repository is **Public** (free tier requirement)

### Workflow Not Running

**Problem**: No deployment happens after push

**Solution**:
1. Check **Actions** tab for workflow status
2. Verify `.github/workflows/deploy.yml` exists in the repository
3. Ensure you're pushing to the `main` branch
4. Check that GitHub Actions is enabled for your repository

## 📊 Deployment Workflow Details

The GitHub Actions workflow (`.github/workflows/deploy.yml`) performs:

1. **Trigger**: Runs on every push to `main` branch
2. **Build Job**:
   - Checks out code
   - Sets up Node.js 20
   - Installs dependencies (`npm ci`)
   - Builds production version (`npm run build`)
   - Uploads `dist/` folder as artifact
3. **Deploy Job**:
   - Downloads the artifact
   - Deploys to GitHub Pages
   - Provides live URL

## 🌐 Your Live URL

After successful deployment, your game will be available at:

```
https://YOUR_USERNAME.github.io/f1-racing-game/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 🔄 Updating the Game

To update your deployed game:

```bash
# Make your changes
# ...

# Build
npm run build

# Commit and push
git add .
git commit -m "Update: description of changes"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy.

## 📝 Additional Configuration

### Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in the root with your domain:
   ```
   yourdomain.com
   ```

2. Update DNS records to point to GitHub Pages

3. Update `vite.config.js` base path if needed

### Environment Variables

If you need environment-specific configurations:

```bash
# Create .env file
VITE_API_URL=https://api.example.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## ✅ Pre-Deployment Checklist

Before pushing to GitHub, verify:

- [ ] All game features work correctly
- [ ] Production build succeeds (`npm run build`)
- [ ] Base path in `vite.config.js` matches repo name
- [ ] `.gitignore` excludes `node_modules/` and `dist/`
- [ ] GitHub Actions workflow file exists
- [ ] Repository is set to Public
- [ ] All files are committed

## 🎯 Quick Deploy Command

For a quick deployment after making changes:

```bash
npm run build && git add . && git commit -m "Deploy update" && git push
```

## 📞 Support

If you encounter issues:

1. Check the **Actions** tab for build logs
2. Review browser console for runtime errors
3. Verify all configuration files are present
4. Ensure repository settings are correct

---

**Your F1 Racing game is ready for deployment! 🏁**
