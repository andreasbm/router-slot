const path = require("path");
const CreateWebpackConfig = require("../../node_modules/@appnest/web-config/create-webpack-config");

const folderPath = {
	SRC: __dirname,
	DIST: path.resolve(__dirname, "../../dist")
};

const fileName = {
	APP: "./app.ts",
	INDEX_HTML: "./index.html"
};

module.exports = CreateWebpackConfig({
	context: folderPath.SRC,
	indexTemplate: fileName.INDEX_HTML,
	outputFolder: folderPath.DIST,
	entry: {
		"app": fileName.APP
	},
	output: {
		path: folderPath.DIST,
		filename: "[name].[hash].js"
	},
	devServerPort: 1236,
	plugins: [],
	prodPlugins: []
});