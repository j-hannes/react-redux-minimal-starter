/* eslint no-console:0 */
require('babel/register')

const webpack = require('webpack')
const path = require('path')
const cssnano = require('cssnano')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
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
      'styles',
      'utils',
      'views'
    ].reduce((acc, dir) => ((acc[dir] = path.resolve('./src/' + dir)) && acc), {})
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          stage: 0,
          optional: ['runtime'],
          env: {
            development: {
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
          }
        }
      }, {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      /* eslint-disable */
      {
        test: /\.woff(\?.*)?$/,
        loader: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.woff2(\?.*)?$/,
        loader: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2"
      }, {
        test: /\.ttf(\?.*)?$/,
        loader: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream"
      }, {
        test: /\.eot(\?.*)?$/,
        loader: "file-loader?prefix=fonts/&name=[path][name].[ext]"
      }, {
        test: /\.svg(\?.*)?$/,
        loader: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml"
      }
      /* eslint-enable */
    ]
  },
  sassLoader: {
    includePaths: path.resolve('./src/styles')
  },
  postcss: [
    cssnano({
      autoprefixer: {
        add: true,
        remove: true,
        browsers: ['last 2 versions']
      },
      discardComments: {
        removeAll: true
      }
    })
  ]
}

webpackConfig.module.loaders = webpackConfig.module.loaders.map(loader => {
  if (/js(?!on)/.test(loader.test)) {
    loader.query.env.development.extra['react-transform'].transforms.push({
      transform: 'react-transform-hmr',
      imports: ['react'],
      locals: ['module']
    })
  }

  return loader
})

export default webpackConfig
