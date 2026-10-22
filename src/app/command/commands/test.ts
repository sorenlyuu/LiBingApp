import {Client, Message} from "discord.js"
import Autoresponder from "../../autoresponder"
import {RespondData, RespondType} from "../../../types/autorespond"
import AppResources from "../../../res/app"
import BotApplication from "../../../object/client"

export default class TestCommand {
	public static readonly command: string = `Test Command`
	public static readonly description: string = `?`
	public static readonly wlrequire: boolean = false
	public static readonly usage: string = `<PRE>test`
	public static readonly triggers: string[] = ["test"]
	public static readonly minimumArgs: number = 0

	public static async run(app: BotApplication, msg: Message, args: string[]) {
        msg.reply(`hi`)
        return
	}
}