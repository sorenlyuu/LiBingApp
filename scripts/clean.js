const fs = require("fs")

const pathsToDelete = ["./dist", "./package-lock.json"]

function clean() {
	for (const path of pathsToDelete) {
		try {
			console.log(`Clean: deleting ${path}`)

			fs.rmSync(path, {recursive: true, force: true})
		} catch (error) {
			console.error(`Clean: failed to delete ${path}:`, error)
		}
	}
}

clean()
