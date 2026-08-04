const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/umd'),
    filename: 'index.js',
    library: 'exampleTypescriptPackage',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.ts(x*)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'config/tsconfig.umd.json',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  // 'http' and 'https' are Node-only built-ins. Marking them external means:
  // - In Node.js (CJS/UMD): the UMD wrapper calls require('http') at runtime → real module
  // - In browser: UMD wrapper looks up window['_'] → undefined, but isNodeEnvironment
  //   is false so createKeepAliveAgent() short-circuits before reaching require()
  externals: {
    http: { commonjs: 'http', commonjs2: 'http', root: '_' },
    https: { commonjs: 'https', commonjs2: 'https', root: '_' },
  },
};
