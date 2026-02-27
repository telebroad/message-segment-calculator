const path = require('path');

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'production',
};

const libraryConfig = {
  ...baseConfig,
  entry: './src/browser/global.ts',
  output: {
    filename: 'segmentsCalculator.js',
    path: path.resolve(__dirname, 'docs/scripts/'),
  },
};

const appConfig = {
  ...baseConfig,
  entry: './src/browser/main.ts',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'docs/scripts/'),
  },
};

module.exports = [libraryConfig, appConfig];
