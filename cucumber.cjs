// Cucumber profiles. Run TypeScript via: NODE_OPTIONS="--import tsx" (set in npm scripts).
const common = {
  paths: ['features/**/*.feature'],
  import: ['features/support/**/*.ts', 'features/steps/**/*.ts'],
  format: [
    'progress',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'junit:reports/cucumber-junit.xml',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: Number(process.env.PARALLEL ?? 1),
  retry: process.env.CI ? 1 : 0,
};

module.exports = {
  default: common,
  smoke: { ...common, tags: '@smoke' },
  regression: { ...common, tags: '@regression' },
  api: { ...common, tags: '@api' },
};
