/* eslint no-console:0 */
require('babel/register')

const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
// const historyApiFallback = require('connect-history-api-fallback')
const chalk = require('chalk')
const webpackConfig = require('./build/webpack/development_hot')

const compiler = webpack(webpackConfig)

const server = express()
const host = 'localhost'
const port = 3000

// server.use(historyApiFallback({
//   verbose: false
// }))

server.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: 'src',
  hot: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  stats: {
    colors: true
  }
}))

server.use(webpackHotMiddleware(compiler))

server.listen(port, host, function() {
  console.log(chalk.green(
    `Server is now running at ${host}:${port}.`
  ))
})
