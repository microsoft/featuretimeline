const webpack = require('webpack');
const path = require('path');
//const PrettierPlugin = require("prettier-webpack-plugin");

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/*
 * We've enabled ExtractTextPlugin for you. This allows your app to
 * use css modules that will be moved into a separate CSS file instead of inside
 * one of your module entries!
 *
 * https://github.com/webpack-contrib/extract-text-webpack-plugin
 *
 */

//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const mode = process.env.NODE_ENV || "development";
const sourcemap = mode === "development";
const plugins = [
	new CopyWebpackPlugin([{
			from: "./node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js",
			to: "libs/VSS.SDK.min.js"
		},
		{
			from: "./node_modules/react/umd/react.production.min.js",
			to: "react.js"
		},
		{
			from: "./node_modules/react-dom/umd/react-dom.production.min.js",
			to: "react-dom.js"
		},
		{
			from: "./src/index.html",
			to: "./"
		},
		{
			from: "./images",
			to: "./images"
		},
		{
			from: "./details.md",
			to: "details.md"
		}
	])
];

if (mode !== "development") {
	plugins.unshift(new UglifyJSPlugin({
		compress: {
			warnings: false
		},
		output: {
			comments: false
		}
	}));
	plugins.unshift(new BundleAnalyzerPlugin({
		analyzerMode: "static",
		generateStatsFile: true
	}));
	//plugins.unshift(new PrettierPlugin());
}
module.exports = {
	entry: './src/FeatureTimeline.tsx',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'umd',
		library: "FeatureTimeline"
	},
	devtool: "source-map",
	mode: mode,
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	module: {
		rules: [{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [{
					loader: "ts-loader"
				}]
			},
			{
				enforce: "pre",
				test: /\.js$/,
				use: [{
					loader: "source-map-loader"
				}]
			},
			{
				test: /\.css$/,
				use: [{
					loader: 'style-loader!css-loader?modules'
				}]
			},
			{
				test: /\.(scss)$/,

				use: [{
						loader: 'style-loader',
						options: {
							sourcemap: sourcemap
						}
					}, {
						loader: 'css-loader',
						options: {
							sourcemap: sourcemap
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourcemap: sourcemap
						}
					}
				]
			}

		]
	},
	externals: [{
			"react": true,
			"react-dom": true,
		},
		/^VSS\//,
		/^TFS\//
	],

	plugins: plugins
};