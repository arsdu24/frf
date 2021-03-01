const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'examples'),
        compress: true,
        hotOnly: true,
        port: 9000
    },
    entry: {
        "detect-changes": path.resolve(__dirname, 'examples') + '/detect-changes/index.tsx'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'examples'),
    }
};
