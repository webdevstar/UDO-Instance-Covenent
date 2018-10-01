module.exports = wallaby => {
  // See: https://github.com/wallabyjs/public/issues/716
  return {
    files: [
      'src/**/*',
      'test/harness/**/*',
      '!**/node_modules/**',
      '!dist/**/*',
    ],
    tests: [
      'test/**/*.Test.js',
      '!**/node_modules/**'
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    setup: function(w) {},
    teradown: function (w) {},
    debug: false,
    testFramework: 'mocha'
  }
}
