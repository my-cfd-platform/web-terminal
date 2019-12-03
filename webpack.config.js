const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    entry: {
      home: './src/index.tsx',
    },
    output: {
      path: path.resolve(__dirname, './wwwroot'),
      filename: '[name].js?[hash]',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpe?g|gif|ico)$/i,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'source-map',
    target: 'web',
    stats: 'errors-only',
    devServer: {
      proxy: {
        '/api': {
          target: 'https://simpletrading-api-dev.monfex.biz',
          pathRewrite: {
            '^/api': '',
          },
          changeOrigin: true,
        },
        // '/signalr': {
        //   target: 'http://localhost:5678',
        //   // target: 'https://simpletrading-api-dev.monfex.biz/',
        //   changeOrigin: false,
        //   logLevel: 'debug' // this what you want
        // },
      },
      compress: true,
      historyApiFallback: true,
      https: false,
      hot: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: './index.html',
        meta: {
          viewport: 'width=device-width, initial-scale=1.0',
        },
        title: 'Hello world - Shadi',
      }),
      new webpack.DefinePlugin({
        WS_HOST:
          argv.mode === 'production'
            ? JSON.stringify(argv.wshost)
            : JSON.stringify('http://localhost:5678/signalr'),
        API_STRING:
          argv.mode === 'production'
            ? JSON.stringify(argv.apistring)
            : JSON.stringify('/api'),
        AUTH_TOKEN: JSON.stringify('TraderID'),
        CHARTING_LIBRARY_PATH:
          argv.mode === 'production'
            ? JSON.stringify('./charting_library/')
            : JSON.stringify('./src/vendor/charting_library/'),
      }),
      new CopyPlugin([{ from: './src/vendor/charting_library/', to: 'charting_library' }]),
    ],
  };
};
