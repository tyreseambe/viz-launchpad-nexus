# Building VIZ Client as Desktop Application

> Complete step-by-step guide to building VIZ Client as a standalone Electron desktop application for Windows, macOS, and Linux

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Configuration](#configuration)
4. [Development Mode](#development-mode)
5. [Building for Production](#building-for-production)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Code Editor** (Recommended: VS Code)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Platform-Specific Requirements

#### Windows
- **Windows 7 or later**
- **Visual Studio Build Tools** (optional, for native modules)
  ```bash
  npm install --global windows-build-tools
  ```

#### macOS
- **macOS 10.13 or later**
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux
- **Ubuntu/Debian:**
  ```bash
  sudo apt-get install -y build-essential
  ```

---

## Initial Setup

### Step 1: Export from Lovable

1. Open your VIZ Client project in Lovable
2. Click the **"Export"** or **"GitHub"** button in the top right
3. Export to GitHub or download as ZIP

### Step 2: Clone or Extract Project

**If using GitHub:**
```bash
git clone https://github.com/YOUR_USERNAME/viz-client.git
cd viz-client
```

**If downloaded as ZIP:**
1. Extract the ZIP file
2. Open terminal/command prompt
3. Navigate to the extracted folder:
   ```bash
   cd path/to/viz-client
   ```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and related libraries
- Vite (build tool)
- Electron
- electron-builder
- All UI components and utilities

**Expected time:** 2-5 minutes depending on internet speed

### Step 4: Install Development Tools

Install `wait-on` for development mode:
```bash
npm install --save-dev wait-on
```

---

## Configuration

### Step 1: Update package.json

Open `package.json` and verify/add these scripts:

```json
{
  "name": "viz-client",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && NODE_ENV=development electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  }
}
```

### Step 2: Verify Electron Configuration

Ensure `electron-builder.json` exists in your project root:

```json
{
  "appId": "com.visionzero.vizclient",
  "productName": "VIZ Client",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis"],
    "icon": "public/favicon.ico"
  },
  "mac": {
    "target": ["dmg"],
    "icon": "public/favicon.ico",
    "category": "public.app-category.games"
  },
  "linux": {
    "target": ["AppImage"],
    "icon": "public/favicon.ico",
    "category": "Game"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### Step 3: Check Electron Files

Verify `electron/main.js` and `electron/preload.js` exist and are properly configured.

---

## Development Mode

### Starting the Development Server

Run the application in development mode:

```bash
npm run electron:dev
```

**What happens:**
1. Vite development server starts on `http://localhost:8080`
2. Wait-on waits for the server to be ready
3. Electron window opens with hot-reload enabled

**Features in dev mode:**
- ✅ Hot reload (changes reflect immediately)
- ✅ DevTools enabled
- ✅ Source maps for debugging
- ✅ Fast iteration

### Common Dev Mode Issues

**Issue: "Port already in use"**
```bash
# Kill process on port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Kill process on port 8080 (macOS/Linux)
lsof -ti:8080 | xargs kill -9
```

**Issue: "Electron window doesn't open"**
- Wait for Vite server to fully start
- Check console for errors
- Verify `electron/main.js` path is correct

---

## Building for Production

### Build for Current Platform

Build for your current operating system:

```bash
npm run electron:build
```

**Build time:** 3-10 minutes (first build downloads Electron binaries)

### Platform-Specific Builds

**Windows (.exe installer):**
```bash
npm run electron:build:win
```

**macOS (.dmg):**
```bash
npm run electron:build:mac
```

**Linux (.AppImage):**
```bash
npm run electron:build:linux
```

### Output Location

Built files are located in the `release/` folder:

```
release/
├── VIZ-Client-Setup-1.0.0.exe     (Windows installer)
├── VIZ Client-1.0.0.dmg            (macOS disk image)
├── VIZ-Client-1.0.0.AppImage       (Linux AppImage)
└── win-unpacked/                   (Unpacked Windows files)
```

### Testing the Build

1. Navigate to `release/` folder
2. Run the installer for your platform
3. Launch VIZ Client from desktop/start menu
4. Test all features (AimTrack, Strafe, Map, etc.)

---

## Troubleshooting

### Build Errors

**Error: "Cannot find module 'electron'"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "ENOENT: no such file or directory"**
- Ensure `dist/` folder exists (run `npm run build` first)
- Check all paths in `electron-builder.json`

**Error: "wine not found" (macOS/Linux building for Windows)**
```bash
# Install wine (macOS)
brew install wine

# Install wine (Ubuntu/Debian)
sudo apt-get install wine64
```

### App Icon Issues

**Windows:** Icon must be `.ico` format (256x256 recommended)
```bash
# Convert PNG to ICO (requires ImageMagick)
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 favicon.ico
```

**macOS:** Icon must be `.icns` format
```bash
# Create .icns from PNG (macOS)
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
# ... (repeat for all sizes)
iconutil -c icns icon.iconset
```

### Performance Issues

**Slow Build Times:**
- Close unnecessary applications
- Exclude `node_modules` from antivirus scans
- Use SSD storage for faster I/O

**Large File Size:**
- Enable compression in `electron-builder.json`:
  ```json
  {
    "compression": "maximum"
  }
  ```

---

## Advanced Configuration

### Code Signing

**Windows (requires certificate):**
```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

**macOS (requires Apple Developer account):**
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

### Auto-Updates

Add to `electron/main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Custom Installer

**Windows NSIS:**
```json
{
  "nsis": {
    "installerIcon": "build/installer.ico",
    "uninstallerIcon": "build/uninstaller.ico",
    "installerHeader": "build/installerHeader.bmp",
    "license": "LICENSE.txt"
  }
}
```

### Multi-Platform Build (CI/CD)

**GitHub Actions example:**
```yaml
name: Build
on: [push]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run electron:build
```

---

## 📦 Required Scripts

Summary of scripts (already included above in Configuration section).

---

## Quick Reference Commands

```bash
# Development
npm run electron:dev          # Run in development mode with hot reload

# Production Builds
npm run electron:build        # Build for current platform
npm run electron:build:win    # Build Windows installer
npm run electron:build:mac    # Build macOS app
npm run electron:build:linux  # Build Linux AppImage

# Utility
npm run build                 # Build web version only
npm run dev                   # Run web version only
```

---

## 🆘 Getting Help

**Common Resources:**
- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Docs](https://www.electron.build/)
- [VIZ Client GitHub Issues](https://github.com/YOUR_USERNAME/viz-client/issues)

**Need Support?**
1. Check the [Troubleshooting](#troubleshooting) section above
2. Search existing GitHub issues
3. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages and logs
   - Steps to reproduce

---

## ✅ Success Checklist

Before distributing your build:

- [ ] Tested on target platform
- [ ] All features work correctly
- [ ] Auth and leaderboards functional
- [ ] App icon displays properly
- [ ] No console errors in production
- [ ] Installer creates desktop shortcut
- [ ] App uninstalls cleanly
- [ ] Version number updated in `package.json`

---

## 📱 Distribution

### Windows
- Share the `.exe` installer file
- Users double-click to install
- App appears in Start Menu and Desktop

### macOS
- Share the `.dmg` disk image
- Users drag app to Applications folder
- May need to allow in Security & Privacy settings

### Linux
- Share the `.AppImage` file
- Users make executable: `chmod +x VIZ-Client-*.AppImage`
- Run directly, no installation needed

---

**Built with ❤️ by Vision Zero Esports**
