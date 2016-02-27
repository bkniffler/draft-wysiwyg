var path = require('path');

var debug = process.env.NODE_ENV === 'development';

module.exports = {
    cache: debug,
    debug: debug,
    devtool: debug ? 'eval' : null,
    entry: path.resolve(__dirname, 'app.js'),
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: [
                        'es2015',
                        'stage-0',
                        'react'
                    ]
                }
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public', 'js')
    }
}