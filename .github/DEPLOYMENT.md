# 📚 Documentation Deployment Guide

This guide explains how the Type Game Engine documentation is automatically deployed to GitHub Pages.

## 🚀 Automatic Deployment

The documentation is automatically built and deployed when:

- 📝 Changes are pushed to the `main` branch
- 🗂️ Files in the `docs/` directory are modified
- ⚙️ The deployment workflow itself is updated
- 🔧 Manual workflow dispatch is triggered

## 🏗️ Deployment Workflow

The deployment process consists of two main jobs:

### 1. 🏗️ Build Documentation
- 📥 Checks out the repository
- 📦 Sets up pnpm and Node.js 20
- 🔧 Installs dependencies with frozen lockfile
- 🏗️ Builds VitePress documentation
- 📁 Creates `.nojekyll` file for GitHub Pages
- 📤 Uploads build artifact

### 2. 🚀 Deploy to GitHub Pages
- 🌐 Deploys the built documentation to GitHub Pages
- ✅ Provides deployment success confirmation with URL

## ⚙️ Configuration

### VitePress Configuration
```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  base: '/Type/',  // GitHub Pages base path
  // ... other config
})
```

### GitHub Pages Settings
1. 🔧 Go to repository **Settings** → **Pages**
2. 📄 Source: **GitHub Actions**
3. ✅ The workflow will handle the rest automatically

## 🔐 Permissions

The workflow uses the following permissions:
- `contents: read` - Read repository contents
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Write ID tokens for deployment

## 🛠️ Manual Deployment

To manually trigger deployment:

1. 🌐 Go to **Actions** tab in GitHub repository
2. 📚 Select "Deploy VitePress Documentation" workflow
3. 🔧 Click "Run workflow" → "Run workflow"

## 📝 Local Development

```bash
# 🚀 Start development server
pnpm docs:dev

# 🏗️ Build documentation locally
pnpm docs:build

# 👀 Preview built documentation
pnpm docs:preview
```

## 🔗 Access Documentation

Once deployed, documentation will be available at:
```
https://henriqueartur.github.io/Type/
```

## 🐛 Troubleshooting

### Common Issues:

**📄 404 Errors on GitHub Pages**
- Ensure `base: '/Type/'` is set in VitePress config
- Check that repository name matches base path

**🏗️ Build Failures**
- Verify all dependencies are properly listed in `package.json`
- Check Node.js version compatibility (using Node 20)

**📁 Missing Assets**
- Ensure all images are in `docs/public/` directory
- Check asset paths are relative to base URL

**🔐 Permission Issues**
- Verify GitHub Pages is enabled for the repository
- Check that workflow permissions are correctly set

## 📊 Workflow Status

You can monitor deployment status:
- 🟢 **Success**: Documentation deployed successfully
- 🟡 **In Progress**: Build/deployment running
- 🔴 **Failed**: Check logs for errors

---

🎓 **Academic Project**: Part of MBA Software Engineering program at USP Brazil