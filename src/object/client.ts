import {Client, GatewayIntentBits, Partials} from "discord.js"
import "dotenv/config"
import Logger from "../util/log"
import ReadyEvent from "../events/evt/ready"
import Autoresponder from "../app/autoresponder"
import CommandHandler from "../app/command"

export default class BotApplication {
	public readonly TOKEN: string
	public readonly ID: string
	public readonly PREFIX: string
	public readonly DEVELOPMENTWL: string[]
	public readonly client: Client
	public readonly logger: Logger = new Logger(`APP`)

	constructor() {
		const missingProperties: string[] = []
		this.TOKEN = process.env.TOKEN ?? `${missingProperties.push("TOKEN")}`
		this.ID = process.env.ID ?? `${missingProperties.push("ID")}`
		this.PREFIX = process.env.PREFIX ?? `${missingProperties.push("PREFIX")}`
		this.DEVELOPMENTWL = process.env.DEVELOPMENTWL?.split(",") ?? []
		if (missingProperties.length > 0) {
			this.logger.err(`.env is missing properties ${missingProperties.join(", ")}`)
			process.abort()
		}
		this.client = new Client({
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages],
		})
		ReadyEvent.bind(() => {
			Autoresponder.init(this)
			CommandHandler.init(this)
			this.logger.log(`All set, started ${this.client.user?.username}`)
		})
	}
}
