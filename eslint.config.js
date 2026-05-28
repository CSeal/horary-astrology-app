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
      // Enforce absolute imports (@/) instead of relative imports.
      // Relative parent imports (../../) are fragile during refactoring and hurt readability.
      // Same-directory imports (./foo) are OK; use @/path/to/foo for modules outside current dir.
      // Exception: src/tw/index.tsx and src/constants/theme.ts are exempted below.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Forbid relative parent imports (../ at any depth)
            {
              group: ['../**'],
              message:
                'Use absolute imports (@/) for modules outside the current directory. Example: @/components/Foo instead of ../../../components/Foo',
            },
            // Forbid CSS components from react-native (must use @/tw wrappers)
            {
              group: ['react-native'],
              importNames: RN_CSS_COMPONENTS,
              message:
                "Import from '@/tw' instead of 'react-native' — className requires CSS wrappers (globalClassNamePolyfill disabled). See src/tw/index.tsx.",
            },
          ],
        },
      ],

      // `i18n.use(...)` and `axios.create(...)` are the canonical idioms in their
      // respective libraries; the named-as-default-member rule is noisy here.
      'import/no-named-as-default-member': 'off',

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
