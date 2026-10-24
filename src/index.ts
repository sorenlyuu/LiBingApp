import Logger from "./util/log"
import BotApplication from "./object/client"
const logger = new Logger(`INIT`)
logger.log(`Initializing client...`)

const app = new BotApplication()

export default app

async function main() {
	await app.initializeEvents()
	await app.client.login(app.TOKEN)
}

main().catch((error) => {
	logger.err(String(error))
})
