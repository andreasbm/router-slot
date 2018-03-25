const rimraf = require("rimraf");
const tsc = require("node-typescript-compiler");
const tsconfig = {json: require("./tsconfig.json")};
const path = require("path");
const fs = require("fs-extra");
const npmBump = require("npm-bump");

async function deploy () {
	await cleanLib();
	await compile();
	// bump();
	copySync("./package.json", "./lib/package.json");
	copySync("./README.md", "./lib/README.md");
}

function cleanLib (callback) {
	return new Promise((res, rej) => {
		rimraf("lib", res);
	});
}

function compile (callback) {
	return new Promise((res, rej) => {
		tsc.compile(
			Object.assign({}, tsconfig.json.compilerOptions, {
				"outDir": "lib",
				"declaration": true
			}),
			["src/lib/router.ts"]
		);
		res();
	});
}

function copyFiles (files) {
	return new Promise((res, rej) => {
		for (const file of files) {
			copySync(`./src/${file}`, `./lib/${file}`);
		}
		res();
	});
}

function copySync (src, dest) {
	fs.copySync(path.resolve(__dirname, src), path.resolve(__dirname, dest));
}

function bump () {
	npmBump("patch");
}

deploy().then(_ => {
	console.log("Done!");
});
