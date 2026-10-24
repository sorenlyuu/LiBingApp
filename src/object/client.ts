import {Client, GatewayIntentBits, Partials} from "discord.js"
import "dotenv/config"
import Logger from "../util/log"
import ReadyEvent from "../events/evt/ready"
import Autoresponder from "../app/autoresponder"
import CommandHandler from "../app/command"
import TaskHandler from "../app/task"
import {Db, MongoClient} from "mongodb"
import {appendFileSync} from "fs"
import EventHandler from "../events"
import Protector from "../util/protect"
import ButtonHandler from "../app/button"
import ModalHandler from "../app/modal"

export default class BotApplication {
	public readonly TOKEN: string
	public readonly ID: string
	public readonly PREFIX: string
	public readonly DEVELOPMENTWL: string[]
	public readonly client: Client
	public readonly logger: Logger = new Logger(`APP`)
	public database: Db | undefined
	private mongoCLI: MongoClient | undefined

	constructor() {
		const missingProperties: string[] = []
		this.TOKEN = process.env.TOKEN ?? `${missingProperties.push("TOKEN")}`
		this.ID = process.env.ID ?? `${missingProperties.push("ID")}`
		this.PREFIX = process.env.PREFIX ?? `${this.logger.warn(`There was no prefix set, so I am using the default which is -`)}-`
		this.DEVELOPMENTWL = process.env.DEVELOPMENTWL?.split(",") ?? []
		if (missingProperties.length > 0) {
			this.logger.err(`.env is missing properties ${missingProperties.join(", ")}`)
			process.abort()
		}

		if (process.env.USE_MONGO === "true") {
			let databaseUrl = process.env.DATABASE_URL
			if (!databaseUrl) {
				appendFileSync(`.env`, `\nDATABASE_URL=mongodb://localhost:27017`, `utf-8`)
				databaseUrl = `mongodb://localhost:27017`
			}
			this.mongoCLI = new MongoClient(databaseUrl)
			this.connectDatabase()
		}

		this.client = new Client({
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages],
		})
		ReadyEvent.bind(async () => {
			await Protector.init()
			await Autoresponder.init()
			await CommandHandler.init()
			await ButtonHandler.init()
			await ModalHandler.init()
			await TaskHandler.init()
			this.logger.log(`All set, started ${this.client.user?.username}`)
		})
	}

	public async initializeEvents() {
		await EventHandler.initializeAll()
	}

	public async connectDatabase() {
		if (!this.mongoCLI) return
		await this.mongoCLI.connect()
		this.database = this.mongoCLI.db(`LiBingDB`)
		this.logger.log(`Started mongoDB`)
	}
}
