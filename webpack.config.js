const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

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
};

module.exports = config;
