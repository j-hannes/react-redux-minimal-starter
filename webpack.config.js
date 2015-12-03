/* eslint no-console:0 */
require('babel/register')

const webpack = require('webpack')
const path = require('path')
const argv = require('yargs').argv
const dotenv = require('dotenv')
const chalk = require('chalk')
const cssnano = require('cssnano')

const pkg = require('./package.json')

dotenv.load()
const config = new Map()

// ------------------------------------
// User Configuration
// ------------------------------------
config.set('dir_src', 'src')
config.set('dir_dist', 'dist')
config.set('dir_test', 'tests')

config.set('coverage_enabled', !argv.watch) // enabled if not in watch mode
config.set('coverage_reporters', [{
  type: 'text-summary'
}, {
  type: 'html',
  dir: 'coverage'
}])

config.set('server_host', 'localhost')
config.set('server_port', process.env.PORT || 3000)

config.set('production_enable_source_maps', false)

// Define what dependencies we'd like to treat as vendor dependencies,
// but only include the ones that actually exist in package.json. This
// makes it easier to remove dependencies without breaking the
// vendor bundle.
config.set('vendor_dependencies', [
  'history',
  'react',
  'react-redux',
  'react-router',
  'redux',
  'redux-simple-router'
].filter(dep => {
  if (pkg.dependencies[dep]) return true

  console.log(chalk.yellow(
    `Package "${dep}" was not found as an npm dependency and won't be ` +
    `included in the vendor bundle.\n` +
    `Consider removing it from vendor_dependencies in ~/config/index.js`
  ))
}))

/*  *********************************************
-------------------------------------------------

All Internal Configuration Below
Edit at Your Own Risk

-------------------------------------------------
************************************************/
// ------------------------------------
// Environment
// ------------------------------------
config.set('env', process.env.NODE_ENV)
config.set('globals', {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.get('env'))
  },
  'NODE_ENV': config.get('env'),
  '__DEV__': config.get('env') === 'development',
  '__PROD__': config.get('env') === 'production',
  '__DEBUG__': config.get('env') === 'development' && !argv.no_debug,
  '__DEBUG_NW__': !!argv.nw
})

// ------------------------------------
// Webpack
// ------------------------------------
config.set('webpack_public_path',
  `http://${config.get('webpack_host')}:${config.get('webpack_port')}/`
)

// ------------------------------------
// Project
// ------------------------------------
config.set('path_project', path.resolve(__dirname, './'))

// ------------------------------------
// Utilities
// ------------------------------------
const paths = (() => {
  const base = [config.get('path_project')]
  const resolve = path.resolve

  const project = (...args) => resolve.apply(resolve, [...base, ...args])

  return {
    project: project,
    src: project.bind(null, config.get('dir_src')),
    dist: project.bind(null, config.get('dir_dist'))
  }
})()

config.set('utils_paths', paths)
config.set('utils_aliases', [
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
].reduce((acc, dir) => ((acc[dir] = paths.src(dir)) && acc), {}))

const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackConfig = {
  name: 'client',
  target: 'web',
  entry: {
    app: [
      paths.project(config.get('dir_src')) + '/app.js'
    ],
    vendor: config.get('vendor_dependencies')
  },
  output: {
    filename: '[name].[hash].js',
    path: paths.project(config.get('dir_dist')),
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin(config.get('globals')),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new HtmlWebpackPlugin({
      template: paths.src('index.html'),
      hash: false,
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true
      }
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: config.get('utils_aliases')
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
    includePaths: paths.src('styles')
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

// NOTE: this is a temporary workaround. I don't know how to get Karma
// to include the vendor bundle that webpack creates, so to get around that
// we remove the bundle splitting when webpack is used with Karma.
const commonChunkPlugin = new webpack.optimize.CommonsChunkPlugin(
  'vendor', '[name].[hash].js'
)
commonChunkPlugin.__KARMA_IGNORE__ = true
webpackConfig.plugins.push(commonChunkPlugin)

webpackConfig.devtool = 'source-map'

webpackConfig.entry.app.push(
  `webpack-hot-middleware/client?path=/__webpack_hmr`,
  `webpack/hot/dev-server`
)

webpackConfig.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
)

// We need to apply the react-transform HMR plugin to the Babel configuration,
// but _only_ when HMR is enabled. Putting this in the default development
// configuration will break other tasks such as test:unit because Webpack
// HMR is not enabled there, and these transforms require it.
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
