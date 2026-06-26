const { withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) =>
  withAppBuildGradle(config, (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const propsPath = path.join(projectRoot, 'signing', 'android-signing.properties');

    if (!fs.existsSync(propsPath)) {
      console.warn('[withAndroidSigning] signing/android-signing.properties not found — skipping');
      return mod;
    }

    const props = parseProperties(fs.readFileSync(propsPath, 'utf8'));
    const keystorePath = path.join(projectRoot, 'signing', 'hora-release.keystore');
    let gradle = mod.modResults.contents;

    // Idempotent — skip if already injected
    if (gradle.includes('signingConfigs.release')) {
      return mod;
    }

    // 1. Append release block inside signingConfigs { debug { ... } }
    const releaseSigningBlock = [
      '        release {',
      `            storeFile file("${keystorePath}")`,
      `            storePassword "${props.HORA_STORE_PASSWORD}"`,
      `            keyAlias "${props.HORA_KEY_ALIAS}"`,
      `            keyPassword "${props.HORA_KEY_PASSWORD}"`,
      '        }',
    ].join('\n');

    gradle = gradle.replace(
      /(signingConfigs \{[\s\S]*?debug \{[\s\S]*?\})/,
      `$1\n${releaseSigningBlock}`,
    );

    // 2. Switch release buildType from debug → release signingConfig
    //    Use lastIndexOf to land inside buildTypes.release, not signingConfigs.debug
    const releaseTypeIdx = gradle.lastIndexOf('        release {');
    if (releaseTypeIdx >= 0) {
      const before = gradle.substring(0, releaseTypeIdx);
      const after = gradle
        .substring(releaseTypeIdx)
        .replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release');
      gradle = before + after;
    }

    mod.modResults.contents = gradle;
    return mod;
  });

function parseProperties(content) {
  return Object.fromEntries(
    content
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
      .filter(([k]) => k),
  );
}
