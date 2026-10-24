import {Client, Message, TextChannel} from "discord.js"
import {RespondData, RespondType} from "../../types/autorespond"
import Logger from "../../util/log"
import AppResources from "../../res/app"
import MessageCreateEvent from "../../events/evt/message"
import BotApplication from "../../object/client"
import {ServerConfig} from "../../types/servercfg"

export default class Autoresponder {
	public static readonly logger: Logger = new Logger(`AUTORESP`)
	public static respondData: RespondData[] = []
	public static guildRespondData: {[guild: string]: RespondData[]} = {}

	public static event(message: Message) {
		if (message.author.bot) return
		let respondData: RespondData[] = this.respondData
		if (message.guildId) {
			const guildRespondData = this.guildRespondData[message.guildId]
			if (guildRespondData) {
				respondData = respondData.concat(guildRespondData)
			}
		}
		respondData.forEach(async (s) => {
			if (s.triggers.some((trigger) => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
				switch (s.respond_type) {
					case RespondType.RESPOND_REPLY:
						message.reply(s.response)
						break
					case RespondType.RESPOND_REACT:
						message.react(s.response)
						break
					case RespondType.RESPOND_URL:
						const url = message.content.split(` `).find((s) => s.startsWith(`https://`))
						if (!url) break
						message.react(`⏳`)
						const embedded = new EmbeddedUrl(url).url
						await message.delete()
						await (message.channel as TextChannel).send(`${message.author.displayName} sent \`${url}\`\n${embedded}`)
						break
					default:
						message.reply(`Unsupported response type ${s.respond_type} (${s.response})`)
						break
				}
			} else return
		})
	}

	public static init(app: BotApplication) {
		this.respondData = AppResources.get("autorespond")
		const serverConfig: ServerConfig = AppResources.get("servercfg")
		for (const [i, v] of Object.entries(serverConfig)) {
			this.guildRespondData[i] = v.autoresponds
		}
		MessageCreateEvent.bind(this.event.bind(this))
		this.logger.log(`Initialized`)
	}

	public static refresh() {
		this.respondData = AppResources.get(`autorespond`)
		this.logger.log(`Refreshed`)
	}
}

class EmbeddedUrl {
	public url: string
	public readonly logger: Logger = new Logger(`EMBEDURL`)

	private readonly URLReplacements = {
		"youtube.com": "koutube.com",
		"youtu.be": "koutu.be",
		"x.com": "fixvx.com",
		"reddit.com": "vxreddit.com",
		"vm.tiktok.com": "d.tnktok.com",
	}

	constructor(originalUrl: string) {
		const key = Object.keys(this.URLReplacements).find((s) => originalUrl.includes(s))
		if (!key) {
			this.url = originalUrl
		} else {
			this.url = originalUrl.replace(key, this.URLReplacements[key as keyof typeof this.URLReplacements])
		}
		this.logger.log(`Embedded ${originalUrl}`)
	}
}
