// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Find the frontend-services package location
// It could be a symlink from node_modules or a direct relative path
let frontendServicesPath = null;
const nodeModulesPath = path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services');
const relativePath = path.resolve(__dirname, '../frontend-services');

if (fs.existsSync(nodeModulesPath)) {
  // Check if it's a symlink
  const stats = fs.lstatSync(nodeModulesPath);
  if (stats.isSymbolicLink()) {
    frontendServicesPath = fs.readlinkSync(nodeModulesPath);
  } else {
    frontendServicesPath = nodeModulesPath;
  }
} else if (fs.existsSync(relativePath)) {
  frontendServicesPath = relativePath;
}

// Add support for resolving subpath exports from frontend-services
if (frontendServicesPath) {
  const i18nPath = path.resolve(frontendServicesPath, 'dist/i18n/index.js');
  
  config.resolver = {
    ...config.resolver,
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      // Map the subpath export to the actual file location
      '@tasks-management/frontend-services/i18n': path.dirname(i18nPath),
    },
  };

  // Custom resolver for the subpath export
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Handle @tasks-management/frontend-services/i18n subpath export
    if (moduleName === '@tasks-management/frontend-services/i18n') {
      if (fs.existsSync(i18nPath)) {
        return {
          type: 'sourceFile',
          filePath: i18nPath,
        };
      }
    }
    
    // Use default resolver for everything else
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
