import {Client, Embed, EmbedBuilder, Message} from "discord.js"
import Autoresponder from "../../autoresponder"
import {RespondData, RespondType} from "../../../types/autorespond"
import AppResources from "../../../res/app"
import BotApplication from "../../../object/client"
import TaskHandler from "../../task"
import app from "../../.."
import UserData from "../../../res/user"

export default class DevCommand {
	public static readonly command: string = `Dev Command`
	public static readonly description: string = `?`
	public static readonly wlrequire: boolean = true
	public static readonly usage: string = `<PRE>dev [func] [...args]`
	public static readonly triggers: string[] = ["dev", "d"]
	public static readonly minimumArgs: number = 2

	public static async run(msg: Message, args: string[]) {
		let action = args[0]!
		const actionData = DevCommands.list[action as keyof typeof DevCommands.list]
		if (!actionData) {
			return msg.reply(`Invalid action: ${action}`)
		}
		args = args.slice(1)
		if (actionData.minArgs > args.length) {
			return msg.reply(`Missing args`)
		}
		const rsp: string | EmbedBuilder = await actionData.func(args)
		msg.reply(rsp instanceof EmbedBuilder ? {embeds: [rsp]} : {content: rsp})

		return
	}
}

class DevCommands {
	public static list: {[action: string]: {minArgs: number; func: Function}} = {
		autorespond: {
			minArgs: 1,
			func: DevCommands.autorespond,
		},
		dataview: {
			minArgs: 1,
			func: DevCommands.dataview
		},
		bdcheck: {
			minArgs: 0,
			func: DevCommands.birthdayToday
		}
	}
	public static async birthdayToday(args: string[]) {
		TaskHandler.runningTasks[`birthday`].birthdayCheck(app)
		return `Ran birthday check task`
	}
	public static async dataview(args: string[]) {
		let data 
		if (args[0] === `app`) {
			data = await AppResources.get(args[1]!)
		} else if (args[0] === `userdata`) {
			data = await UserData.get(args[1]!)
		}
		if (!data) return `No such query`
		return "```"+JSON.stringify(data, null, 4)+"```"
	}
	public static async autorespond(args: string[]) {
		const action = args[0]
		switch (action) {
			case "add":
				const data: RespondData[] = Autoresponder.respondData
				let [name, trigger, type, rsp] = args.slice(1, 5)
				type = `RESPOND_${type!.toUpperCase()}`
				if (!RespondType[type as keyof typeof RespondType]) {
					return `Invalid type: Only react and reply are available.`
				}
				let existing: RespondData | number | any = data.findIndex((s) => s.name.toLowerCase().replace(` `, `_`) === name!.toLowerCase().replace(` `, `_`))
				existing !== -1
					? existing
					: (() => {
							data.push({
								name: name,
								triggers: [],
								respond_type: RespondType[type as keyof typeof RespondType],
								response: rsp,
							} as RespondData)
							existing = data.length - 1
						})()
				if (data[existing]!.triggers.includes(trigger!)) {
					return `The trigger already exists anyways. So i'm ignoring your command`
				}
				data[existing]!.triggers.push(trigger!)
				await AppResources.save(data, `autorespond`)
				Autoresponder.refresh()
				return `Successfully added \n\`\`\`json\n${JSON.stringify(data[existing], null, 4)}\n\`\`\``
			case "remove":
				let e = Autoresponder.respondData
				let id = args[1]
				let index = e.findIndex((s) => s.name === id)
				if (index !== -1) {
					e.splice(index, 1)
				} else {
					return `${id} isnt even a thing`
				}
				await AppResources.save(e, `autorespond`)
				Autoresponder.refresh()
				return `Successfully removed ${id}`
			case "view":
				let s = Autoresponder.respondData
				const embed = new EmbedBuilder().setTitle(`My autoresponders`).setThumbnail(app.client.user!.displayAvatarURL())
				s.forEach((v) => {
					embed.addFields({inline: true, name: v.name, value: `Triggered by: ${v.triggers.join(", ")}\nResponseType: ${v.respond_type}\nResponse: ${v.response}`})
				})
				return embed
		}
	}
}
