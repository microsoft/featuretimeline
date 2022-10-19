const webpack = require("webpack");
const path = require("path");
//const PrettierPlugin = require("prettier-webpack-plugin");

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

//deprecated in webpack 5
//const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

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
    new CopyWebpackPlugin({ 
        patterns: [
        {
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
            from: "./src/FeatureTimeline/featuretimeline.html",
            to: "./"
        },
        {
            from: "./src/EpicRoadmap/EpicRoadmap.html",
            to: "./"
        },
        {
            from: "./src/PortfolioPlanning/PortfolioPlanning.html",
            to: "./"
        },
        {
            from: "./src/PortfolioPlanning/AddToPlanAction.html",
            to: "./"
        },
        {
            from: "./src/PortfolioPlanning/SelectPlanDialog.html",
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
    ]
})
];

if (mode !== "development") {
    plugins.unshift(
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            generateStatsFile: true
        })
    );
    //plugins.unshift(new PrettierPlugin());
}
module.exports = {
    entry: {
        FeatureTimeline: "./src/FeatureTimeline/FeatureTimeline.tsx",
        EpicRoadmap: "./src/EpicRoadmap/EpicRoadmap.tsx",
        PortfolioPlanning: "./src/PortfolioPlanning/PortfolioPlanning.tsx",
        AddToPlanAction: "./src/PortfolioPlanning/AddToPlanAction.tsx",
        SelectPlanDialog: "./src/PortfolioPlanning/SelectPlanDialog.tsx"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "[name]"
    },
    devtool: "inline-source-map",
    mode: mode,
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "azure-devops-extension-sdk": path.resolve(__dirname, "node_modules/azure-devops-extension-sdk"),
            "vss-web-extension-sdk": path.resolve(__dirname, "node_modules/vss-web-extension-sdk/lib/VSS.SDK"),
        },
        modules: [path.resolve("."), "node_modules"]
    },
    // optimization: {
    //     minimize: true,
    //     minimizer: [new TerserPlugin()],
    //   },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false
                }
              },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                use: [
                    {
                        loader: "source-map-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(scss)$/,
                use: ["style-loader","css-loader", "azure-devops-ui/buildScripts/css-variables-loader","sass-loader"]
            },
            {
                test: /\.woff$/,
                use: [
                    {
                        loader: "base64-inline-loader"
                    }
                ]
            }
        ]
    },
    externals: [
        {
            react: true,
            "react-dom": true
        },
        /^VSS\//,
        /^TFS\//
    ],

    plugins: plugins
};
