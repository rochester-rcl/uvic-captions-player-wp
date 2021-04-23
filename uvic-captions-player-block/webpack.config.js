const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    index: "./src/index.tsx",
    client: "./src/client.tsx"
  },
  module: {
    ...defaultConfig.module,
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ 
          loader: "ts-loader", 
          options: { 
            transpileOnly: true 
          } 
        }],
        exclude: /node_modules/
      },
      ...defaultConfig.module.rules
    ]
  },
  plugins: [
    ...defaultConfig.plugins,
  ],
  resolve: {
    ...defaultConfig.resolve,
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },

  output: {
    ...defaultConfig.output,
    filename: "[name].js",
    path: path.resolve(__dirname, "build")
  },
};
