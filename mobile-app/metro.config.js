// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Find the frontend-services package location
function findFrontendServicesPath() {
  const nodeModulesPath = path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services');
  const relativePath = path.resolve(__dirname, '../frontend-services');
  
  // First check node_modules (EAS build environment)
  if (fs.existsSync(nodeModulesPath)) {
    try {
      const stats = fs.lstatSync(nodeModulesPath);
      if (stats.isSymbolicLink()) {
        return fs.realpathSync(nodeModulesPath);
      }
      return nodeModulesPath;
    } catch (e) {
      // Continue to check relative path
    }
  }
  
  // Check relative path (local development)
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }
  
  return null;
}

const frontendServicesPath = findFrontendServicesPath();

// Add support for resolving @tasks-management/frontend-services package
// Always set up the resolver, even if path not found (for EAS builds)
const nodeModulesPath = path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services');
const relativePath = path.resolve(__dirname, '../frontend-services');

// Map the package in extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@tasks-management/frontend-services': nodeModulesPath,
};

// Custom resolver to handle the package
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @tasks-management/frontend-services (main package)
  if (moduleName === '@tasks-management/frontend-services') {
    // Try multiple possible paths for the main entry point
    const possibleMainPaths = [
      path.resolve(nodeModulesPath, 'dist/index.js'),
      path.resolve(relativePath, 'dist/index.js'),
      path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services/dist/index.js'),
      path.resolve(__dirname, '../frontend-services/dist/index.js'),
    ];
    
    for (const mainPath of possibleMainPaths) {
      try {
        if (fs.existsSync(mainPath)) {
          return {
            type: 'sourceFile',
            filePath: mainPath,
          };
        }
      } catch (e) {
        // Continue to next path
      }
    }
  }
  
  // Handle subpath exports (legacy support)
  if (
    moduleName === '@tasks-management/frontend-services/i18n' ||
    moduleName === '@tasks-management/frontend-services/dist/i18n'
  ) {
    const possibleI18nPaths = [
      path.resolve(nodeModulesPath, 'dist/i18n/index.js'),
      path.resolve(relativePath, 'dist/i18n/index.js'),
    ];
    
    for (const i18nPath of possibleI18nPaths) {
      try {
        if (fs.existsSync(i18nPath)) {
          return {
            type: 'sourceFile',
            filePath: i18nPath,
          };
        }
      } catch (e) {
        // Continue to next path
      }
    }
  }
  
  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
