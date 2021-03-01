const path = require('path');

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
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    plugins: [
                        [
                            "babel-plugin-transform-react-jsx",
                            {
                                "pragma": "fuck"
                            }
                        ],
                        [
                            "babel-plugin-jsx-pragmatic",
                            {
                                "module": "@frxf/core",
                                "import": "fuck"
                            }
                        ]
                    ],
                    presets: [
                        [
                            "@babel/preset-typescript",
                            {
                                "isTSX": true,
                                "allExtensions": true
                            }
                        ]
                    ]
                }
            },
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
        path: path.resolve(__dirname),
    }
};
