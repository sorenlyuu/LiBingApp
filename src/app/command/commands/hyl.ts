import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, MessagePayload, PermissionFlagsBits, User} from "discord.js"
import {randomUUID} from "node:crypto"
import ButtonHandler from "../../button"
import UserData from "../../../res/user"
import axios from "axios"

export default class HoyoLabCommand {
	public static readonly command: string = `HoyoLab Command`
	public static readonly description: string = `?`
	public static readonly wlrequire: boolean = false
	public static readonly usage: string = `<PRE>hyl <game> <action>
    > hyl redeem <asia/na/eu> code
	> hyl daily
    > hyl link
    > hyl unlink`
	public static readonly triggers: string[] = ["hyl", "hoyolab"]
	public static readonly minimumArgs: number = 1

	public static async run(msg: Message, args: string[]) {
		const action = args[0]!
		if (["redeem"].includes(action) && !args[1]) return msg.reply(this.usage)
		if (action === "redeem" && !args[2]) return msg.reply(this.usage)
		const actionFunction = HoyoLabActions.actionList[action as keyof typeof HoyoLabActions.actionList]
		if (!actionFunction) return msg.reply(this.usage)
		const rsp: ButtonBuilder | string = await actionFunction(msg.author, args.slice(1))
		await msg.reply(rsp instanceof ButtonBuilder ? {components: [new ActionRowBuilder<ButtonBuilder>().addComponents(rsp)]} : {content: rsp})
	}
}

class HoyoLabActions {
	public static readonly actionList = {
		link: this.link,
		unlink: this.unlink,
		redeem: this.redeem,
		daily: this.checkin,
	}

	public static async link(author: User, args: string[]): Promise<ButtonBuilder> {
		const uuid = await ButtonHandler.addButtonCache(`link`, author)
		const button: ButtonBuilder = new ButtonBuilder()
			.setCustomId(Buffer.from(`link_${uuid}`, "utf-8").toBase64())
			.setStyle(ButtonStyle.Primary)
			.setLabel(`Link HoyoLab Account`)
		return button
	}

	public static async unlink(author: User, args: string[]): Promise<string> {
		const user = (await UserData.get(author.id))!
		if (!user.HoyoLabAuthToken || !user.HoyoLabAccountId) return `You havent even linked it but ok`
		delete user.HoyoLabAuthToken
		delete user.HoyoLabAccountId
		await UserData.save(user, author.id)
		return `Unlinked`
	}

	public static async checkin(author: User, args: string[]): Promise<string> {
		const userData = await UserData.get(author.id)
		if (!userData || !userData.HoyoLabAuthToken) return `Please link your account first`
		try {
			const headers = {
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
				"x-rpc-app_version": "1.5.0",
				"x-rpc-client_type": "5",
				"x-rpc-language": "en-US",
				"Cookie": `cookie_token_v2=${userData.HoyoLabAuthToken}; account_id_v2=${userData.HoyoLabAccountId};`,
			}
			const dailyClaim = await axios.post(`https://sg-act-public-api.hoyolab.com/event/sol/sign?lang=en-us`, {act_id: 'e202102251931481'}, {headers})
			const dailyInfo = await axios.get(`https://sg-act-public-api.hoyolab.com/event/sol/info?lang=en-us&act_id=e202102251931481`, {headers})
			if (dailyClaim.data.message === 'OK') {
				return `Checked in for today.\nYour total days this month is **${dailyInfo.data.total_sign_day}**`
			} else return dailyClaim.data.message || `undefined`
		} catch (error) {
			return `Failed to sign: ${error}`
		}
	}

	public static async redeem(author: User, args: string[]): Promise<string> {
		const code = args[1]!
		const server = args[0]!
		let servercode: string | undefined

		const userData = await UserData.get(author.id)
		if (!userData || !userData.HoyoLabAuthToken) return `Please link your account first`
		if (!code) return `Invalid parameters`

		if (server === `asia`) {
			servercode = `os_asia`
		} else if (server === `eu`) {
			servercode = `os_euro`
		} else if (server === `na`) {
			servercode = `os_usa`
		}

		if (!servercode) return `Invalid parameters`

		try {
			const headers = {
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
				"x-rpc-app_version": "1.5.0",
				"x-rpc-client_type": "5",
				"x-rpc-language": "en-US",
				"Cookie": `cookie_token_v2=${userData.HoyoLabAuthToken}; account_id_v2=${userData.HoyoLabAccountId};`,
			}
			const getIngameInfo = await axios.get(`https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesByCookieToken?lang=en&region=${servercode}&game_biz=hk4e_global&sLangKey=en-us`, {headers})
			const gameData = getIngameInfo.data?.data?.list?.[0]
			const redeemCode = await axios.get(`https://public-operation-hk4e.hoyoverse.com/common/apicdkey/api/webExchangeCdkey?uid=${gameData.game_uid}&region=${servercode}&lang=en&cdkey=${encodeURIComponent(code)}&game_biz=hk4e_global&sLangKey=en-us`, {headers})
			return redeemCode.data?.message ?? `undefined`
		} catch (error) {
			return `Failed to redeem code: ${error}`
		}
	}
}
