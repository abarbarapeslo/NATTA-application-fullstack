const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK's `@firebase/auth` package declares a "react-native" entry
// (dist/rn/index.js) that only registers the auth component when you call
// initializeAuth with RN persistence. Metro prefers that entry even on web,
// which causes "Component auth has not been registered yet" when calling
// getAuth in a browser. Drop "react-native" from the resolver mainFields on
// web so Metro picks the standard browser/ESM bundle.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Only redirect `@firebase/auth` (and `firebase/auth`) to its browser ESM
  // entry on web. Leave every other module to use Metro's defaults so we
  // don't accidentally swap @babel/runtime helpers between ESM/CJS, which
  // breaks `_objectWithoutPropertiesLoose` / `_objectDestructuringEmpty`.
  if (
    platform === "web" &&
    (moduleName === "@firebase/auth" || moduleName === "firebase/auth")
  ) {
    const webContext = {
      ...context,
      unstable_conditionNames: ["browser", "import", "require"],
    };
    if (originalResolveRequest) {
      return originalResolveRequest(webContext, moduleName, platform);
    }
    return context.resolveRequest(webContext, moduleName, platform);
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
