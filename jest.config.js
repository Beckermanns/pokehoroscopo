export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/app.js',
    '!src/js/pokemon.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};