const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Enables automatic code signing in the generated Xcode project.
 * expo prebuild generates CODE_SIGN_STYLE = Manual by default —
 * this plugin overrides it to Automatic so local builds work without
 * manually configuring signing in Xcode each time.
 *
 * Team ID priority:
 *   1. APPLE_TEAM_ID env var  (override for org/CI builds)
 *   2. app.json ios.appleTeamId  (default — currently personal DGAHHMV358)
 *
 * TODO: when AstraSk org Apple Developer account is ready —
 *   update app.json ios.appleTeamId + eas.json submit.production.ios.appleTeamId
 *   to the new org Team ID, and regenerate with: npm run prebuild:clean
 *   Or use: APPLE_TEAM_ID=<org_team_id> npm run prebuild:clean
 */
module.exports = (config) =>
  withXcodeProject(config, (config) => {
    const teamId = process.env.APPLE_TEAM_ID || config.ios?.appleTeamId;
    const pbxBuildConfig = config.modResults.pbxXCBuildConfigurationSection();

    for (const key in pbxBuildConfig) {
      const section = pbxBuildConfig[key];
      if (section?.buildSettings) {
        section.buildSettings.CODE_SIGN_STYLE = '"Automatic"';
        if (teamId) {
          section.buildSettings.DEVELOPMENT_TEAM = `"${teamId}"`;
        }
      }
    }

    return config;
  });
