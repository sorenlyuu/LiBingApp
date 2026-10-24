import { readdirSync } from "fs"
import Logger from "../util/log"
import path from "path"
import BotApplication from "../object/client"
import { createRequire } from "module"
import app from ".."

export default class EventHandler {
    public static readonly logger: Logger = new Logger("EVT")

    public static async initializeAll() {
        this.logger.log("Starting event handlers...")

        const handlers = path.join(__dirname, "evt")
        const require = createRequire(__filename)
        const events = readdirSync(handlers).filter(s => /\.(ts|js)$/.test(s) && !s.endsWith(".d.ts"))

        for (const event of events) {
            const loaded = require(path.join(handlers, event))
            const EventClass = loaded.default
            if (EventClass && typeof EventClass.init === "function") {
                this.logger.log(`Initializing ${event}...`)
                await EventClass.init(app.client)
            } else {
                this.logger.err(`${event} has no initializer function.`)
            }
        }

        this.logger.log("All event handlers started.")
    }
}