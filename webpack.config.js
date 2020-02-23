const path = require('path');

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const nodeModulesDir = path.join(__dirname, "./node_modules");
const srcDir = path.join(__dirname, "./src");

module.exports = env => {
    const mode = env.NODE_ENV === "production" ? "production" : "development";

    console.log(mode);

    return {
        mode: mode,
        entry: {
            main: ["./src/app.ts", "./src/styles/style.scss"],
            vendor: ["phaser"]
        },
        resolve: {
            extensions: ['.ts', '.js', ".scss"],
            modules: [srcDir, nodeModulesDir]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: [/node_modules/]
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
            new HtmlWebpackPlugin({
                template: "./src/index.htm"
            }),
            new webpack.DefinePlugin({
                __DEBUG__: JSON.stringify(mode === "development")
            })
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
                name: "vendor"
            },
            minimize: mode === "production",
            minimizer: [new TerserPlugin()]
        },
        devServer: {
            port: 3010,
            contentBase: path.join(__dirname, 'assets'),
            writeToDisk: true
        },
        performance: {
            hints: false
        },
        devtool: mode === "development" ? 'source-map' : "none",
    }
}