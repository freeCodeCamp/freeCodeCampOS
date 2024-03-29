const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: path.join(__dirname, 'client/index.tsx'),
  devtool: 'inline-source-map',
  mode: process.env.NODE_ENV || 'development',
  devServer: {
    compress: true,
    port: 9000
  },
  watch: process.env.NODE_ENV === 'development',
  watchOptions: {
    ignored: ['**/node_modules', '**/config']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              require.resolve('@babel/plugin-syntax-import-assertions'),
              [
                'prismjs',
                {
                  languages: [
                    'javascript',
                    'css',
                    'html',
                    'json',
                    'markdown',
                    'sql',
                    'rust',
                    'typescript',
                    'jsx',
                    'c',
                    'csharp',
                    'cpp',
                    'dotnet',
                    'python',
                    'pug',
                    'handlebars'
                  ],
                  plugins: [],
                  theme: 'okaidia',
                  css: true
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        use: ['ts-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'client', 'index.html'),
      favicon: path.join(__dirname, 'client', 'assets/fcc_primary_small.svg')
    })
  ]
};
