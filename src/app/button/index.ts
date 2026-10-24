import {ButtonInteraction, MessageFlags, User} from "discord.js"
import Logger from "../../util/log"
import {readdirSync} from "fs"
import {createRequire} from "module"
import path from "node:path"
import InteractionCreateEvent from "../../events/evt/interaction"
import {existsSync} from "node:fs"
import {randomUUID} from "node:crypto"

export default class ButtonHandler {
	public static readonly logger: Logger = new Logger(`BTN`)
	public static buttonHandlers: {buttonId: string; uuid: string; handler: Function}[] = []

	public static async event(interaction: ButtonInteraction) {
		const customId = Buffer.from(interaction.customId, "base64").toString(`utf-8`)
		const [id, uuid, ...args] = customId.split(`_`)
		if (!id || !uuid) return
		const handler = this.buttonHandlers.find((s) => s.buttonId === id && s.uuid === uuid)
		if (!handler) return interaction.reply({content: `hi`, flags: MessageFlags.Ephemeral})
		if (handler.uuid !== Buffer.from(interaction.user.id).toBase64()) return interaction.reply({content: `greedy ho stop tryna eat up all the buttons`, flags: MessageFlags.Ephemeral})
		await handler.handler(interaction, args)
	}

	public static async addButtonCache(id: string, author: User) {
		const btn = path.join(__dirname, `buttons/${id}.js`)
		if (!existsSync(btn)) {
			this.logger.err(`No such ${btn}`)
			return
		}
		const require = createRequire(__filename)
		const mod = require(btn).default

		// ts is actually not uuid (it was supposed to be) im too lazy to rename it
		const uuid = Buffer.from(author.id).toBase64()
		const btncl = new mod(id, uuid)
		this.buttonHandlers.push({buttonId: id, uuid, handler: btncl.manage.bind(btncl)})
		this.logger.log("New button instance was made")
		setTimeout(
			() => {
				this.buttonHandlers = this.buttonHandlers.filter((s) => s.buttonId !== id || s.uuid !== uuid)
			},
			2 * 60 * 1000,
		)
		return uuid
	}

	public static async init() {
		InteractionCreateEvent.bindButton(this.event.bind(this))
		this.logger.log("ButtonManager manages all buttons without interactionism")
	}
}
