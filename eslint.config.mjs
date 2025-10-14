import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * ESLint Flat Config for NestJS + TypeScript
 * - 和前端 Prettier/Import 风格一致
 * - 无 React 依赖，适配 Node 环境
 */
export default [
  { ignores: ['dist', 'node_modules', 'generated'] },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // ✅ 加上 spec 的 tsconfig，让测试文件不报 parser 错
        project: ['./tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: 2021,
      },
      globals: {
        ...globals.node,
        console: true,
        process: true,
        __dirname: true,
        module: true,
      },
    },
    // ✅ 关键：为 import 插件配置 resolver
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'], // 让它读你的 tsconfig
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.ts', '.js'],
        },
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

      // ↓ 未使用：都改成 warn
      'no-unused-vars': 'off', // 关掉 base 版本，避免与 TS 规则冲突
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 🧠 TS 基础规则微调
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      // 🧩 Import 解析
      'import/extensions': 'off',
      'import/no-unresolved': 'error',
    },
  },

  // ✅ 测试文件专属：注入 Jest 全局
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  prettier,
];
