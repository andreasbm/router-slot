const {defaultResolvePlugins, defaultKarmaConfig, clean} = require("@appnest/web-config");
const path = require("path");

module.exports = (config) => {
	config.set({
		...defaultKarmaConfig({
			rollupPlugins: [
				clean({targets: ["dist"]}),
				...defaultResolvePlugins()
			]
		}),
		basePath: "src",
		logLevel: config.LOG_INFO
	});
};