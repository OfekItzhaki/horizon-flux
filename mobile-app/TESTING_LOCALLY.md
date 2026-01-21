# Testing Metro Bundler Locally Without EAS Build

Since EAS builds take 70+ minutes on the free tier, here are ways to test the Metro bundler resolution locally:

## Option 1: Test Metro Bundler Directly (Fastest)

This simulates what happens during an EAS build without actually building:

```bash
# 1. Build the frontend-services package
cd ../frontend-services
npm install
npm run build
cd ../mobile-app

# 2. Install dependencies (this will symlink frontend-services)
npm install

# 3. Test Metro bundler resolution
npx expo start --no-dev --minify
```

This will start Metro in production mode (similar to EAS build) and you'll see if it can resolve the package. Press `Ctrl+C` once you see it successfully start bundling.

## Option 2: Use EAS Build Locally

Build locally on your machine (requires Docker):

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Build locally (this is faster but still takes time)
eas build --platform android --local
```

## Option 3: Test Metro Resolution Script

Create a simple test script:

```bash
# In mobile-app directory
node -e "
const Metro = require('metro');
const path = require('path');
const config = require('./metro.config.js');
const resolver = config.resolver || {};

console.log('Testing package resolution...');
const testPath = require.resolve('@tasks-management/frontend-services');
console.log('✅ Package resolved to:', testPath);
"
```

## Option 4: Check if Package is Installed Correctly

```bash
# Check if the package is symlinked correctly
ls -la mobile-app/node_modules/@tasks-management/

# Check if dist folder exists in frontend-services
ls -la frontend-services/dist/
```

## Quick Test Before Building

Before triggering an EAS build, always run:

```bash
cd ../frontend-services && npm run build && cd ../mobile-app && npm install && npm start
```

If this works locally, the EAS build should work too (assuming the package.json preinstall script runs correctly).