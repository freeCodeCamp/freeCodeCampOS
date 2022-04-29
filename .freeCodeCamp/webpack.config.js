import { join, resolve as _resolve, dirname } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import process from "process";
import path from "path";
import webpack from "webpack";
// import { cwd } from "process";

const __dirname = dirname(".freeCodeCamp");
export default {
  entry: "./client/index.tsx",
  devtool: "inline-source-map",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    static: {
      directory: join(__dirname, "client", "assets"),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.(css|scss)$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // fallback: {
    //   // path: path,
    //   // process: process,
    // },
  },
  output: {
    filename: "bundle.js",
    path: _resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: join(__dirname, "client", "index.html"),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
