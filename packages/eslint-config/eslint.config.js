import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

// mimic CommonJS variables -- needed for FlatCompat in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default [
  // Global ignores
  { 
    ignores: [
      '**/dist/**', 
      '**/node_modules/**', 
      '**/.turbo/**',
      '**/.angular/**',
      '**/generated/**',
      '**/prisma/client/**',
      '**/coverage/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.e2e-spec.ts'
    ] 
  },

  // Specify files to be linted
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __filename: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        NodeFilter: 'readonly',
        ShadowRoot: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        PerformanceObserver: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        ErrorEvent: 'readonly',
        ResizeObserver: 'readonly',
        
        // Test globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        
        // Angular-specific globals
        ngDevMode: 'readonly',
        Zone: 'readonly',
        
        // Browser dialogs
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly'
      }
    }
  },

  // Use FlatCompat to extend recommended ESLint rules
  ...compat.extends('eslint:recommended'),

  // Use FlatCompat to extend Prettier configuration
  ...compat.extends('prettier'),

  // Include TypeScript recommended and stylistic configs directly
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Add custom rules or overrides
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'warn',
      'no-constant-condition': 'warn',
      'no-fallthrough': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      'no-unsafe-finally': 'warn',
      'no-sparse-arrays': 'warn'
    },
  },
];
