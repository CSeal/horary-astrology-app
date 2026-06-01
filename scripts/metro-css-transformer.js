/**
 * Metro CSS transformer wrapper.
 * react-native-css processes ALL .css files including node_modules,
 * which causes lightningcss 1.32.x to fail on:
 *   1. @import statements in the second pass
 *   2. var(--x, env(...)) syntax
 *
 * This wrapper returns empty modules for node_modules CSS files.
 * It also wraps compile() to catch errors for any node_modules CSS
 * that slips through (belt-and-suspenders).
 *
 * react-native-css does not export ./metro/metro-transformer via package.json
 * "exports", so we resolve it via the exported ./metro index entry, then
 * navigate to the transformer file with an absolute path (bypasses exports).
 */
const path = require('path');
const metroDir = path.dirname(require.resolve('react-native-css/metro'));
const cssTransformer = require(path.join(metroDir, 'metro-transformer.js'));

// Patch compile() in react-native-css to silently skip node_modules CSS
// that lightningcss cannot process. This catches files that bypass the
// filePath check below (e.g. when Metro passes a symlink-resolved path).
const compilerIndexPath = path.join(path.dirname(metroDir), 'compiler', 'index.js');
const compilerModule = require(compilerIndexPath);
const _originalCompile = compilerModule.compile;
compilerModule.compile = function patchedCompile(css, options) {
  try {
    return _originalCompile(css, options);
  } catch (err) {
    const filename = options?.filename ?? '';
    if (filename.includes('node_modules')) {
      // Return empty stylesheet — node_modules CSS styles are irrelevant on native
      return { stylesheet: () => ({}), warnings: () => [] };
    }
    throw err;
  }
};

module.exports = {
  async transform(config, projectRoot, filePath, data, options) {
    // Fast path: skip CSS from node_modules before it reaches the transformer
    if (filePath.includes('node_modules') && /\.(s?css|sass)$/.test(filePath)) {
      return {
        dependencies: [],
        output: [
          {
            data: { code: '(function(){})();', lineCount: 1, map: [] },
            type: 'js/module',
          },
        ],
      };
    }
    return cssTransformer.transform(config, projectRoot, filePath, data, options);
  },
};
