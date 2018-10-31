const rimraf = require("rimraf");
const tsc = require("node-typescript-compiler");
const tsconfig = {json: require("@appnest/web-config/tsconfig.json")};
const path = require("path");
const fs = require("fs-extra");
const npmBump = require("npm-bump");

const outLib = "dist";

async function deploy () {
	await cleanLib();
	await compile();
	// bump();
	copySync("./package.json", `./${outLib}/package.json`);
	copySync("./README.md", `./${outLib}/README.md`);
}

function cleanLib (callback) {
	return new Promise((res, rej) => {
		rimraf(outLib, res);
	});
}

function compile (callback) {
	return new Promise((res, rej) => {
		tsc.compile(
			{
				...tsconfig.json.compilerOptions,
				lib: [
					"es2015.promise",
					"dom",
					"scripthost",
					"es7",
					"es6",
					"es2017",
					"es2017.object",
					"es2015.proxy",
					"esnext"
				],
				"outDir": outLib,
				"target": "es2017",
				"importHelpers": true,
				"declaration": true
			},
			["src/lib/index.ts"]
		);
		res();
	});
}

function copyFiles (files) {
	return new Promise((res, rej) => {
		for (const file of files) {
			copySync(`./src/${file}`, `./${outLib}/${file}`);
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
