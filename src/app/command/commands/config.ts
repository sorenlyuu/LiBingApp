import {Message, PermissionFlagsBits} from "discord.js"
import AppResources from "../../../res/app"
import BotApplication from "../../../object/client"
import {Birthday, Config, ServerConfig} from "../../../types/servercfg"
import {RespondData, RespondType} from "../../../types/autorespond"
import Autoresponder from "../../autoresponder"

type BirthdayResult = {ok: true; action: "add"; birthday: Birthday; message: string} | {ok: true; action: "remove"; name: string; message: string} | {ok: false; message: string}

export default class ConfigCommand {
	public static readonly command: string = `Config Command`
	public static readonly description: string = `Configure the current server's settings`
	public static readonly wlrequire: boolean = false
	public static readonly usage: string = `<PRE>config <setting> <...args>
	> config chnl_birthday_annc <channel_id>
	> config autorespond add/remove name ?trigger ?type ?response
	> config birthday add/remove name ?DD/MM`
	public static readonly permissionrequire: bigint = PermissionFlagsBits.ManageGuild
	public static readonly triggers: string[] = ["cfg", "config"]
	public static readonly minimumArgs: number = 2
	private static readonly supportedFields: string[] = ["chnl_birthday_annc", "birthday", "autorespond"]

	public static async run(app: BotApplication, msg: Message, args: string[]) {
		const setting = args[0]!
		const value = args[1]!
		if (!ConfigCommand.supportedFields.includes(setting)) return msg.reply(`Invalid setting`)
		if (!msg.guildId) return msg.reply(`this isnt a server`)
		const config = await getGuildCfg(msg.guildId)
		let resultMsg = `Done!`
		switch (setting) {
			case `birthday`: {
				const result = convert(args.slice(1))
				if (!result.ok) return msg.reply(result.message)
				resultMsg = result.message
				if (result.action === `add`) {
					config.birthdays.push(result.birthday)
				} else if (result.action === `remove`) {
					const birthday = config.birthdays.findIndex((s: Birthday) => s.name.toLowerCase() === result.name.toLowerCase())
					if (birthday === -1) return msg.reply(`like who tf is ${result.name} what the fuck? i didnt even know there was a ${result.name} at my birthday data`)
					config.birthdays.splice(birthday, 1)
				}
				break
			}

			case `autorespond`: {
				const res = convertAr(args.slice(1))
				if (!res.ok) return msg.reply(res.message)
				resultMsg = res.message
				const existing = config.autoresponds.findIndex((s) => s.name.toLowerCase() === res.name?.toLowerCase())
				if (res.action === `add`) {
					if (existing === -1) config.autoresponds.push(res.respond!)
					else {
						if (config.autoresponds[existing]) {
							config.autoresponds[existing].triggers = config.autoresponds[existing].triggers.concat(res.respond?.triggers!)
						}
					}
				} else if (res.action === `remove`) {
					if (existing === -1) return msg.reply(`${res.name} isnt a thing`)
					config.autoresponds.splice(existing, 1)
				}
				break
			}

			case `chnl_birthday_annc`:
				config.chnl_birthday_annc = value
				break
		}
		const data: ServerConfig = AppResources.get(`servercfg`)
		data[msg.guildId] = config
		AppResources.save(data, `servercfg`)
		if (setting === `autorespond`) Autoresponder.refresh()
		msg.reply(resultMsg)
		return
	}
}

async function getGuildCfg(guildId: string): Promise<Config> {
	const data: ServerConfig = AppResources.get(`servercfg`)
	if (!data[guildId]) {
		data[guildId] = {
			chnl_birthday_annc: "",
			autoresponds: [],
			birthdays: [],
		}
		AppResources.save(data, `servercfg`)
	}
	return data[guildId]
}

function convertAr(args: string[]) {
	const [action, name, trigger, respondType, response] = [args[0], args[1], args[2], args[3], args[4]]
	if (!name) return {ok: false, message: `Invalid parameters`}
	if (action === `add`) {
		if (!trigger || !respondType || !response) return {ok: false, message: `Invalid parameters`}
		if (![`reply`, `react`].includes(respondType.toLowerCase())) return {ok: false, message: `Respond type must be reply or react`}
		const respond: RespondData = {
			name: name,
			triggers: [trigger],
			respond_type: RespondType[`RESPOND_${respondType!.toUpperCase()}` as keyof typeof RespondType],
			response: response!,
		}
		return {ok: true, action: `add`, respond, message: `Added ${name}`}
	} else if (action === `remove`) return {ok: true, action: `remove`, name, message: `Removed ${name}`}
	else return {ok: false, message: `Invalid parameters`}
}

function convert(args: string[]): BirthdayResult {
	const action = args[0]
	const name = args[1]
	if (action !== `add` && action !== `remove`) {
		return {ok: false, message: `Usage: birthday add/remove <name> ?<DD/MM>`}
	}
	if (!name) return {ok: false, message: `who`}
	if (action === `remove`) {
		return {ok: true, action: `remove`, name, message: `Removed ${name}'s birthday`}
	}
	const date = args[2]
	if (!date) return {ok: false, message: `date where`}
	const comp = date.split(`/`)
	const day = Number(comp[0])
	const month = Number(comp[1])
	const valid = Number.isInteger(day) && Number.isInteger(month) && day >= 1 && day <= 31 && month >= 1 && month <= 12
	if (!valid) {
		return {ok: false, message: `pls use the gregorian calendar x`}
	}
	const birthday: Birthday = {name, date: `${String(day).padStart(2, `0`)}/${String(month).padStart(2, `0`)}`}
	return {ok: true, action: `add`, birthday, message: `Set ${name}'s birthday to ${birthday.date}`}
}
