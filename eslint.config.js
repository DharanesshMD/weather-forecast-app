module.exports = {
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended'
    ],
    plugins: [
      '@typescript-eslint',
      'react-hooks'
    ],
    rules: {
      // Handling unused variables and imports
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
  
      // Allow some explicit any usage where necessary
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  
      // Handling React Hooks dependencies
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
  
      // Handling JSX and React specific rules
      'react/no-unescaped-entities': 'error',
      'react/prop-types': 'off',
      '@next/next/no-img-element': 'warn',
  
      // Handling imports
      '@typescript-eslint/no-require-imports': 'warn',
      'import/no-anonymous-default-export': 'warn',
  
      // Additional TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    ignorePatterns: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      '**/*.test.ts',
      '**/*.test.tsx'
    ]
  };