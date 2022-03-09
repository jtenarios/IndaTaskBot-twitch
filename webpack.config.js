// const path = require("path");
// const HTMLWebpackPlugin = require("html-webpack-plugin");

// const Dotenv = require('dotenv-webpack');

// module.exports = {
//   entry: "./src/app.js",
//   output: {
//     filename: "bundle.js",
//     path: path.resolve(__dirname, "dist"),
//   },
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: ["style-loader", "css-loader"],
//       },
//     ],
//   },
//   plugins: [
//     new HTMLWebpackPlugin({
//       filename: "index.html",
//       template: "./index.html",
//     }),
//     new Dotenv()
//   ],
//   mode: "production",
// };

const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack"); // version Heroku

const Dotenv = require('dotenv-webpack'); //--version local

module.exports = {
    entry: "./src/app.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
        },],
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: "index.html",
            template: "./index.html",
        }),
        new Dotenv(), //--version local
        // version para subir a heroku // fuente: https://stackoverflow.com/questions/59759085/heroku-failed-to-load-env
        new webpack.DefinePlugin({
            'process.env': {
                'USERNAME': JSON.stringify(process.env.USERNAME),
                'PASSWORD': JSON.stringify(process.env.PASSWORD),
                'CHANNELS': JSON.stringify(process.env.CHANNELS),
                'CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
                'CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET),
            }
        }),
    ],
    mode: "production",
    performance: {

        hints: false
    }

};