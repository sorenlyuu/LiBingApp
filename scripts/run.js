const fs = require("fs")
const {spawn} = require("child_process")

function start() {
	console.log("[START] Starting application...")

	const app = spawn("node", ["dist/index.js"], {cwd: process.cwd(), stdio: "inherit"})

	app.on("error", (error) => console.error("[START] Failed:", error.message))
	//app.on('close', () => {spawn('node', ['scripts/clean.js'])})
}

spawn('node', ['scripts/clean.js'])
const build = spawn("npx", ["tsc"], {cwd: process.cwd(), shell: true, stdio: "inherit"})

build.on("close", (code) => {
	if (code !== 0) {
		console.error(`[BUILD] Build failed with exit code ${code}`)
		return
	}

	console.log("[BUILD] Build completed.")
	start()
})
