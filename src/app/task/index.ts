import {Client, Message, PermissionFlagsBits} from "discord.js"
import {RespondData, RespondType} from "../../types/autorespond"
import Logger from "../../util/log"
import AppResources from "../../res/app"
import MessageCreateEvent from "../../events/evt/message"
import {CommandInfo} from "../../types/command"
import BotApplication from "../../object/client"
import {readdirSync} from "fs"
import {createRequire} from "module"
import path from "node:path"

export default class TaskHandler {
    public static readonly logger: Logger = new Logger(`CMD`)
    public static runningTasks: {[taskName: string]: any} = {}

    public static async init() {
        this.logger.log("Loading tasks...")
        const handlers = path.join(__dirname, "tasks")
        const require = createRequire(__filename)
        const commands = readdirSync(handlers).filter((s) => /\.(ts|js)$/.test(s) && !s.endsWith(".d.ts"))

        for (const command of commands) {
            const loaded = require(path.join(handlers, command))
            const task = loaded.default
            this.runningTasks[command.replace(`.js`, ``)] = task
            this.runningTasks[command.replace(`.js`, ``)].run()
        }

        this.logger.log("All tasks has been started")
    }
}
