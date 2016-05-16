var path = require('path');

module.exports = function(){
	return {
	    root: path.resolve(__dirname, '..'),
	    app: path.resolve(__dirname, 'app.js'), 
	    cssModules: false,
	    alias: {
	      'draft-wysiwyg': path.resolve(__dirname, '..', 'src'),
	    }
  };
}