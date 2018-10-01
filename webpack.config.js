const Obfuscator = require('webpack-obfuscator')
const path = require('path')
const obfuscatorConfig = require('./obfuscatorConfig')

const { name } = require('./package.json')

module.exports = {
  entry: './src/covenant.js',
  mode: 'production',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    library: name,
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env'],
            plugins: [
              'babel-plugin-transform-runtime',
              'babel-plugin-transform-object-rest-spread'
            ]
          }
        }
      }
    ]
  },
  plugins: [new Obfuscator(obfuscatorConfig)]
}
