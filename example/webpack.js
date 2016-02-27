var path = require('path');

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