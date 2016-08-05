var webpack = require('webpack');

module.exports = {
  entry: './public/scripts/main.js',
  output: {
    filename: './public/scripts/build/bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
