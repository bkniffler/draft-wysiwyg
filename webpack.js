var path = require('path');
module.exports = {
    debug: false,
    entry: path.resolve(__dirname, 'js', 'app.js'),
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
            }
        ]
    },
    output: {filename: 'app.js', path: './public/js'}
}