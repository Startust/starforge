import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

/**
 * ESLint Flat Config for NestJS + TypeScript
 * - 和前端 Prettier/Import 风格一致
 * - 无 React 依赖，适配 Node 环境
 */
export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: 2021,
      },
      globals: {
        console: true,
        process: true,
        __dirname: true,
        module: true,
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...ts.configs.recommended.rules,

      // ✅ Import 顺序与分组
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // 🚫 未使用的 import/变量
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 🧠 TS 基础规则微调
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      // 🧩 Import 解析
      'import/no-unresolved': 'error',
    },
  },
  prettier,
];
