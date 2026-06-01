const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config, {
  // inline variables break PlatformColor in CSS variables
  inlineVariables: false,
  // className support added via src/tw wrappers, not global polyfill
  globalClassNamePolyfill: false,
});

// Intercept CSS imports that originate from node_modules at the resolver level.
// lightningcss 1.32.0 crashes on `var(--x, env(...))` syntax used by @expo/log-box.
// Returning { type: 'empty' } prevents those files from reaching the CSS transformer.
// We check originModulePath (the importing file) so our own src/ CSS is unaffected.
const rnCssResolveRequest = nativewindConfig.resolver?.resolveRequest;
nativewindConfig.resolver = {
  ...nativewindConfig.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (
      /\.(s?css|sass)$/.test(moduleName) &&
      context.originModulePath != null &&
      context.originModulePath.includes('/node_modules/')
    ) {
      return { type: 'empty' };
    }
    if (rnCssResolveRequest) {
      return rnCssResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Keep transformer wrapper as a secondary safeguard.
// Resolves via the exported ./metro entry to avoid package.json "exports" restrictions.
nativewindConfig.transformerPath = path.resolve(__dirname, 'scripts/metro-css-transformer.js');

module.exports = nativewindConfig;
