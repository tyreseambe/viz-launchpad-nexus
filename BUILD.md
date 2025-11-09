# Building VIZ Client as Desktop App

## 🚀 Quick Start

### Development Mode
```bash
npm run electron:dev
```

### Build Windows .exe
```bash
npm run electron:build
```

The installer will be in `release/` folder.

---

## 📋 Required Scripts

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && NODE_ENV=development electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  }
}
```

Also add to `package.json` root level:
```json
{
  "main": "electron/main.js"
}
```

---

## 🛠️ Setup Steps

1. **Export project to GitHub** (via Lovable's Export button)
2. **Clone locally**:
   ```bash
   git clone <your-repo-url>
   cd viz-launchpad-nexus
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Install wait-on** (for dev mode):
   ```bash
   npm install --save-dev wait-on
   ```

5. **Update package.json** with scripts above

6. **Test in dev mode**:
   ```bash
   npm run electron:dev
   ```

7. **Build the .exe**:
   ```bash
   npm run electron:build
   ```

---

## 📦 Output

- **Windows**: `release/VIZ-Client-Setup-{version}.exe`
- **Mac**: `release/VIZ Client-{version}.dmg`
- **Linux**: `release/VIZ-Client-{version}.AppImage`

---

## 🎯 Features Included

✅ Native window controls  
✅ System tray integration ready  
✅ Always-on-top toggle for overlays  
✅ Transparency mode for OBS  
✅ Desktop shortcuts on install  
✅ Auto-updater ready (configure in main.js)

---

## 🔧 Customization

- **App icon**: Replace `public/favicon.ico` with 256x256 .ico file
- **Installer options**: Edit `electron-builder.json`
- **Window settings**: Modify `electron/main.js`

---

## 📝 Notes

- First build takes longer (downloads Electron binaries)
- Windows builds require Windows or CI/CD
- Mac builds require macOS with Xcode
- Code signing requires certificates (optional for testing)
