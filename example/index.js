var express = require('express');
var path = require('path');
var fs = require('fs');

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.resolve(__dirname, 'assets'));
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
    //callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({
  storage : storage,
  limits: {
    fields: 10,
    files: 3,
    fileSize: 1000000
  }
}).array('files', 3);

var APP_PORT = process.env.PORT||3030;

var app = express();
if(process.env.NODE_ENV !== 'production'){
  process.env.NODE_ENV = 'development';
  var wrappack = require('wrappack');
  var config = require('./config');
  wrappack(app, config());
  /*var webpack = require('webpack');
  var webpackMiddleware = require("webpack-dev-middleware");
  var config = require('./webpack');

  var compiler = webpack(config);
  app.use(webpackMiddleware(compiler, {
    contentBase: '/public/',
    publicPath: '/js/',
    stats: {colors: true}
  }));*/
}

app.post('/upload', upload, function(req, res) {
  var file = req.files;

  setTimeout(function(){
    req.files.forEach(function(file){
      fs.unlink(file.path, function(err) {});
    })
  }, 1*60000);

  res.json({
    success: true,
    files: file.map(function(file){
      return {
        encoding: file.encoding,
        filename: file.filename,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.originalname,
        url: '/'+file.originalname
      }
    })
  });
});

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'assets')));
app.use('/node_modules', express.static(path.resolve(__dirname, '..', 'node_modules')));
app.use(function(err, req, res, next) {
  res.status(500).json(err);
});
app.listen(APP_PORT, function(){
  console.log('Server is now running on http://localhost:'+APP_PORT);
});
