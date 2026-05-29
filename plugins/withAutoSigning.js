const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Enables automatic code signing in the generated Xcode project.
 * expo prebuild generates CODE_SIGN_STYLE = Manual by default —
 * this plugin overrides it to Automatic so local builds work without
 * manually configuring signing in Xcode each time.
 */
module.exports = (config) =>
  withXcodeProject(config, (config) => {
    const teamId = config.ios?.appleTeamId;
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
