const path = require("path");
const {CreateWebpackConfig, defaultDevServerConfig} = require("../../node_modules/@appnest/web-config/create-webpack-config");

const folderPath = {
	SRC: __dirname,
	DIST: path.resolve(__dirname, "../../dist")
};

const fileName = {
	APP: "./app.ts",
	INDEX_HTML: "./index.html"
};

const devServer = defaultDevServerConfig(folderPath.DIST);
devServer.port = "2345";

module.exports = CreateWebpackConfig({
	context: folderPath.SRC,
	indexTemplate: fileName.INDEX_HTML,
	outputFolder: folderPath.DIST,
	devServer,
	entry: {
		"app": fileName.APP
	},
	output: {
		path: folderPath.DIST,
		filename: "[name].[hash].js"
	},
	plugins: [],
	prodPlugins: []
});