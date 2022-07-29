const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const packageJson = require("./package.json");

const PATHS = {
  entryPoint: path.resolve(__dirname, "src/lib/index.ts"),
  bundles: path.resolve(__dirname, "dist/_bundles"),
};

const config = {
  mode: "production",
  entry: {
    journifyio: [PATHS.entryPoint],
    "journifyio.min": [PATHS.entryPoint],
  },
  output: {
    path: PATHS.bundles,
    filename: "[name].js",
    library: {
      name: "journifyio",
      type: "window",
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "source-map",
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        include: /\.min\.js$/,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version),
    }),
  ],
};

module.exports = config;
