import {Client} from "discord.js"
import Logger from "../../util/log"

export default class MessageCreateEvent {
	public static listeners: Function[] = []
	public static readonly logger: Logger = new Logger(`EVTMSGC`)

	public static async init(client: Client) {
		client.on('messageCreate', (...args) => {
			this.listeners.forEach((t) => {
				t(...args)
			})
		})
        this.logger.log(`Started!`)
	}

    public static async bind(func: Function) {
        this.listeners.push(func)
        this.logger.log(`An event was binded to me, i am binded as fuck`)
    }
}
