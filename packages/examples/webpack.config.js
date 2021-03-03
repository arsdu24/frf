const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, './src'),
        compress: true,
        hotOnly: true,
        port: 9000
    },
    entry: {
        "detect-changes": path.resolve(__dirname, './src/detect-changes/index.tsx')
    },
    plugins: [
        new webpack.ProvidePlugin({
            fuck: ['@frxf/core', 'default'],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                    compilerOptions: {
                        jsx: "react",
                        jsxFactory: "fuck",
                        jsxFragmentFactory: "fuck",
                    }
                }
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname),
    }
};
