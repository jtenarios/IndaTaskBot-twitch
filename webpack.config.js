const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: './index.html'
    }),
    new Dotenv()
  ],
  mode: 'production'
}
