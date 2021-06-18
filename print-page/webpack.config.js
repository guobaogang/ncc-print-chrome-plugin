const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        "print_page/index": './src/print_page/index.jsx',
        "popup/index": './src/popup/index.jsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    module: {
        rules: [{
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            }
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './index.html',
            filename: 'print_page/index.html',
            chunks: ['print_page/index']
        }),
        new HtmlWebPackPlugin({
            template: './index.html',
            filename: 'popup/index.html',
            chunks: ['popup/index']
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 8080
    }
}