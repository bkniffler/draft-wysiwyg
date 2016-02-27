var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin-webpack-2");

var debug = process.env.NODE_ENV === 'development', production = !debug;

module.exports = {
    cache: debug,
    debug: debug,
    devtool: production ? 'eval' : null,
    entry: path.resolve(__dirname, 'app.js'),
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public', 'js')
    }
}