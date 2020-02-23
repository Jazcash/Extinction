const path = require('path');

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const nodeModulesDir = path.join(__dirname, "./node_modules");
const srcDir = path.join(__dirname, "./src");

module.exports = env => {
    const mode = env.NODE_ENV === "production" ? "production" : "development";

    return [{
        mode: mode,
        watch: mode === "development",
        entry: {
            main: ["./src/client/app.ts", "./src/client/styles/style.scss"],
            vendor: ["phaser"]
        },
        output: {
            path: __dirname + "/dist/client"
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
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
            new HtmlWebpackPlugin({
                template: "./src/client/index.htm"
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
        performance: {
            hints: false
        },
        devtool: mode === "development" ? 'source-map' : "none",
    },
    {
        mode: mode,
        watch: mode === "development",
        target: "node",
        externals: [nodeExternals()],
        entry: {
            app: ["./src/server/app.ts"],
        },
        output: {
            filename: "[name].js",
            path: __dirname + "/dist/server"
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: [/node_modules/]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
        ]
    }]
}