// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Find the frontend-services package location
// In EAS builds, it's in node_modules as a local file dependency
function findFrontendServicesPath() {
  const nodeModulesPath = path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services');
  const relativePath = path.resolve(__dirname, '../frontend-services');
  
  // First check node_modules (EAS build environment)
  if (fs.existsSync(nodeModulesPath)) {
    try {
      // Check if it's a symlink
      const stats = fs.lstatSync(nodeModulesPath);
      if (stats.isSymbolicLink()) {
        return fs.realpathSync(nodeModulesPath);
      }
      return nodeModulesPath;
    } catch (e) {
      // Fallback to relative path
    }
  }
  
  // Check relative path (local development)
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }
  
  return null;
}

const frontendServicesPath = findFrontendServicesPath();

// Add support for resolving subpath exports from frontend-services
if (frontendServicesPath) {
  const i18nPath = path.resolve(frontendServicesPath, 'dist/i18n/index.js');
  
  // Custom resolver for the subpath export
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Handle @tasks-management/frontend-services/i18n subpath export
    if (moduleName === '@tasks-management/frontend-services/i18n') {
      // In EAS builds, the package is in node_modules
      // Try node_modules path first (for EAS builds)
      const nodeModulesI18nPath = path.resolve(__dirname, 'node_modules/@tasks-management/frontend-services/dist/i18n/index.js');
      
      // Try relative path (for local development)
      const relativeI18nPath = path.resolve(__dirname, '../frontend-services/dist/i18n/index.js');
      
      // Try calculated path from found frontend-services location
      const calculatedPath = frontendServicesPath ? path.resolve(frontendServicesPath, 'dist/i18n/index.js') : null;
      
      const possiblePaths = [
        nodeModulesI18nPath,  // EAS build path
        relativeI18nPath,     // Local development path
        calculatedPath,       // Calculated from found location
        i18nPath,             // Original calculated path
      ].filter(Boolean); // Remove null/undefined values
      
      for (const possiblePath of possiblePaths) {
        try {
          if (fs.existsSync(possiblePath)) {
            return {
              type: 'sourceFile',
              filePath: possiblePath,
            };
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      // If file doesn't exist, fall back to node_modules resolution
      // This allows Metro to try its default resolution which should work
      // since the package.json has the exports field
    }
    
    // Use default resolver for everything else
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
