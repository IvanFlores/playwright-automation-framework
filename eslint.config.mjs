import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'reports', 'cucumber.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
