const { startDevServer } = require('@cypress/webpack-dev-server')

const webpackConfig = {
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  mode: 'development',
  devtool: false,
  output: {
    publicPath: '/',
    chunkFilename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs|ts|tsx)$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/, /\.modules\.css$/i],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}

/**
 * @type Cypress.PluginConfig
 */
module.exports = (on, config) => {
  if (config.testingType !== 'component') {
    throw Error(`This is a component testing project. testingType should be 'component'. Received ${config.testingType}`)
  }

  on('dev-server:start', (options) => {
    return startDevServer({ options, webpackConfig, })
  })

  return config
}