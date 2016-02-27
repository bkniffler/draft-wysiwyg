var express = require('express');
var path = require('path');

var APP_PORT = process.env.PORT||3000;

var app;
if(process.env.NODE_ENV !== 'production'){
  var webpack = require('webpack');
  var WebpackDevServer = require('webpack-dev-server');
  var compiler = webpack({
    debug: false,
    entry: path.resolve(__dirname, 'js', 'app.js'),
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: 'style!raw',
        }
      ]
    },
    output: {filename: 'app.js', path: '/'}
  });
  app = new WebpackDevServer(compiler, {
    contentBase: '/public/',
    publicPath: '/js/',
    stats: {colors: true}
  });
}
else {
  app = express();
}
// Serve static resources
app.use('/', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.listen(APP_PORT, function(){
  console.log('Server is now running on http://localhost:'+APP_PORT);
});
