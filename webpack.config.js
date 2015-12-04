/* eslint no-console:0 */

const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const resolvePath = (acc, dir) =>
    (acc[dir] = path.resolve('./src/' + dir)) && acc

const webpackConfig = {
  name: 'client',
  devtool: 'source-map',
  target: 'web',
  entry: {
    app: [
      './src/app.js',
      'webpack/hot/dev-server',
      'webpack-hot-middleware/client?path=/__webpack_hmr'
    ],
    vendor: [
      'history',
      'react',
      'react-redux',
      'react-router',
      'redux',
      'redux-simple-router'
    ]
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve('./dist'),
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: [
      'actions',
      'components',
      'constants',
      'containers',
      'layouts',
      'reducers',
      'routes',
      'services',
      'store',
      'utils',
      'views'
    ].reduce(resolvePath, {})
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          plugins: ['react-transform'],
          extra: {
            'react-transform': {
              transforms: [{
                transform: 'react-transform-catch-errors',
                imports: ['react', 'redbox-react']
              }]
            }
          }
        }
      }, {
        test: /\.s?css$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(woff2?|ttf|eot|svg)(\?.*)?$/,
        loader: 'url-loader'
      }
    ]
  }
}

export default webpackConfig
