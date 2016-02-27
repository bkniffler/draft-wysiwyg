var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin-webpack-2");
module.exports = {
    cache: false,
    debug: false,
    devtool: null,
    entry: path.resolve(__dirname, 'js', 'app.js'),
    plugins: [
        new ExtractTextPlugin('../css/bundle.css')
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            }
        ]
    },
    output: {filename: 'app.js', path: './public/js'}
}