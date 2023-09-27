module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'prettier',
    ],
    root: true,
    env: {
      node: true,
      jest: true,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-dupe-class-members': ['error'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/promise-function-async': 'error',
      'consistent-return': 'error',
      'import/namespace': 'off',
      'import/no-useless-path-segments': [
        'error',
        {
          noUselessIndex: true,
        },
      ],
      'import/no-unresolved': [2, { ignore: ['^~/*'] }],
      'no-await-in-loop': 'warn',
      'no-duplicate-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['src/*'],
        },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
    },
  };
  
  