var express = require('express');
var path = require('path');

var APP_PORT = process.env.PORT||3000;

var app;
if(process.env.NODE_ENV !== 'production'){
  process.env.NODE_ENV = 'development';
  var webpack = require('webpack');
  var WebpackDevServer = require('webpack-dev-server');
  var config = require('./webpack');

  var compiler = webpack(config);
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
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.use('/css', express.static(path.resolve(__dirname, '..', 'styles')));
app.use('/node_modules', express.static(path.resolve(__dirname, '..', 'node_modules')));
app.listen(APP_PORT, function(){
  console.log('Server is now running on http://localhost:'+APP_PORT);
});
