import Logger from "./util/log"
;import BotApplication from "./object/client"
import EventHandler from "./events"
import Protector from "./util/protect"
(async () => {
	const logger = new Logger(`INIT`)
	logger.log(`Initializing client...`)
	Protector.init()
	const app = new BotApplication()
    await app.client.login(app.TOKEN)
	await EventHandler.initializeAll(app)
})()
