import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from 'url';

// Because __dirname available for CommonJS but not Module JS
// https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/*
import webpack from 'webpack';

const config: webpack.Configuration = {
*/
const config = {
	entry: {
		background: path.resolve(__dirname, "source/scripts/background.ts"),
		content: path.resolve(__dirname, "source/scripts/content.ts"),
		data: path.resolve(__dirname, "source/scripts/data.ts"),
		types: path.resolve(__dirname, "source/scripts/types.ts"),
		utilities: path.resolve(__dirname, "source/scripts/utilities.ts"),
	},
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "scripts/[name].js",
	},
	resolve: {
		extensions: [ ".tsx", ".ts", ".js" ],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "source/*.json", to: "[name].json" },
				{ from: "source/icons/*", to: "icons/[name][ext]" },
				{ from: "source/styles/*", to: "styles/[name][ext]" }
			],
		}),
	],
};

export default (env, argv) => {
	if (argv.mode === 'development') {
		config.mode = 'development';
		config.devtool = 'eval';
	}

	if (argv.mode === 'production') {
		config.mode = 'production';
	}

	return config;
};
