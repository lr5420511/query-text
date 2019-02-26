'use strict';

const [join, CleanWebpack] = [
    require('path').join, require('clean-webpack-plugin')
];

module.exports = {
    entry: {
        'query-text': ['babel-polyfill', './src/index.js']
    },
    output: {
        path: join(__dirname, 'build'),
        filename: '[name].build.js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                loader: ['babel-loader'],
                exclude: '/node_modules/'
            }
        ]
    },
    plugins: [new CleanWebpack(['./build'])]
};