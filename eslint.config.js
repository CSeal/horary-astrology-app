// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const RN_CSS_COMPONENTS = [
  'View',
  'Text',
  'ScrollView',
  'Pressable',
  'TextInput',
  'TouchableOpacity',
  'FlatList',
  'SectionList',
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    rules: {
      // Enforce CSS wrapper imports from @/tw instead of react-native.
      // globalClassNamePolyfill is disabled in metro.config.js to preserve
      // PlatformColor in CSS variables — className only works via @/tw wrappers.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react-native'],
              importNames: RN_CSS_COMPONENTS,
              message:
                "Import from '@/tw' instead of 'react-native' — className requires CSS wrappers (globalClassNamePolyfill disabled). See src/tw/index.tsx.",
            },
          ],
        },
      ],

      // Prevent inline hex colors — all colors must come from src/constants/theme.ts
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message:
            'Hardcoded hex color detected. Use tokens from src/constants/theme.ts instead.',
        },
      ],
    },
  },
  {
    // MUST come after the main rules block in flat config — later entries win.
    // src/tw/ is the wrapper implementation — it must import from react-native directly.
    // src/constants/theme.ts is the single authoritative source of hex tokens.
    files: ['src/tw/**', 'src/constants/theme.ts'],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]);
