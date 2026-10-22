import {Client, Message} from "discord.js"
import {RespondData, RespondType} from "../../types/autorespond"
import Logger from "../../util/log"
import AppResources from "../../res/app"
import MessageCreateEvent from "../../events/evt/message"
import BotApplication from "../../object/client"

export default class Autoresponder {
	public static readonly logger: Logger = new Logger(`AUTORESP`)
	public static respondData: RespondData[] = []

	public static event(message: Message) {
        if (message.author.bot) return
		this.respondData.forEach((s) => {
			if (s.triggers.some((trigger) => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
				switch (s.respondType) {
					case RespondType.RESPOND_REPLY:
						message.reply(s.response)
						break
					case RespondType.RESPOND_REACT:
						message.react(s.response)
						break
					default:
						message.reply(`Unsupported response type ${s.respondType} (${s.response})`)
						break
				}
			} else return
		})
	}

	public static init(app: BotApplication) {
		this.respondData = AppResources.get("autorespond")
		MessageCreateEvent.bind(this.event.bind(this))
		this.logger.log(`Initialized`)
	}

	public static refresh() {
		this.respondData = AppResources.get(`autorespond`)
		this.logger.log(`Refreshed`)
	}
}
