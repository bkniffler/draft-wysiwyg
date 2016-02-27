var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin-webpack-2");

var debug = process.env.NODE_ENV === 'development', production = !debug, plugins = [];

if(production){
    plugins.push(new ExtractTextPlugin('../css/bundle.css'));
}

module.exports = {
    cache: debug,
    debug: debug,
    devtool: production ? 'eval' : null,
    entry: path.resolve(__dirname, 'app.js'),
    plugins: plugins,
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
            {
                test: /\.css$/,
                loader: debug ? "style-loader!css-loader" : ExtractTextPlugin.extract("style-loader", "css-loader")
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public', 'js')
    }
}