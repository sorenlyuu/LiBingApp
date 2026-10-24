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
import app from "../.."

export default class CommandHandler {
	public static readonly logger: Logger = new Logger(`CMD`)
	public static commandList: CommandInfo[] = []

	public static async event(message: Message) {
		const isItCmd = message.content.startsWith(app.PREFIX)
		if (!isItCmd) return
		const args = message.content.split(` `)
		if (args.length < 1) return this.logger.warn(`For some reason it was a command but it has nothing at all`)
		this.commandList.forEach(async (s) => {
			if (s.triggers.find((trigger) => trigger === args[0]!.replace(`-`, ``))) {
				this.logger.log(`${message.author.username} used ${s.command}: ${args.join(" -")}`)

				if (s.wlrequire && !app.DEVELOPMENTWL.includes(message.author.id)) {
					message.react("❌")
					this.logger.log(`but its dev only`)
					return
				}

				if (s.permissionrequire) {
					const guildUser = await message.guild?.members.fetch({user: message.author})
					if (guildUser && !guildUser.permissions.has(s.permissionrequire)) {
						this.logger.log(`but they had no permissions`)
						message.reply(`You do not have permission to use this command`)
						return
					}
				}

				if (args.length < s.minimumArgs) {
					message.reply(`Usage: ${s.usage}`)
					this.logger.log(`but it was missing args`)
					return
				}

				await s.func(message, args.slice(1))
				return
			}
		})
	}

	public static async init() {
		this.logger.log("Starting command handler...")
		const handlers = path.join(__dirname, "commands")
		const require = createRequire(__filename)
		const commands = readdirSync(handlers).filter((s) => /\.(ts|js)$/.test(s) && !s.endsWith(".d.ts"))

		for (const command of commands) {
			const loaded = require(path.join(handlers, command))
			const cmdcl = loaded.default
			if (cmdcl && typeof cmdcl.run === "function") {
				this.commandList.push({
					command: cmdcl.command,
					description: cmdcl.description,
					wlrequire: cmdcl.wlrequire,
					usage: cmdcl.usage.replace(`<PRE>`, app.PREFIX),
					triggers: cmdcl.triggers,
					minimumArgs: cmdcl.minimumArgs,
					func: cmdcl.run,
				})
				this.logger.log(`Registered ${command}`)
			} else {
				this.logger.err(`${command} has no run function.`)
			}
		}

		MessageCreateEvent.bind(this.event.bind(this))

		this.logger.log("All commands registered!")
	}
}
