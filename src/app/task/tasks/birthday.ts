import app from "../../.."
import BotApplication from "../../../object/client"
import AppResources from "../../../res/app"
import {ServerConfig} from "../../../types/servercfg"
import Logger from "../../../util/log"
import cron from "node-cron"
export default class BirthdayTask {
	private  static readonly logger: Logger = new Logger(`BIRTHDAYTASK`)

	public static async announce(msg: string, channelId: string) {
		const channel = await app.client.channels.fetch(channelId)
		if (!channel) return
		if (channel.isSendable()) {
			channel.send(msg)
			this.logger.log(`Announced birthday:\n${msg}`)
		}
		return
	}

	public static async birthdayCheck() {
		const date = new Date()
		const day = String(date.getDate()).padStart(2, `0`)
		const month = String(date.getMonth() + 1).padStart(2, `0`)
		const dateKey = `${day}/${month}`
		const servers: ServerConfig = await AppResources.get(`servercfg`)
		for (const [i, v] of Object.entries(servers)) {
			const birthdayData = v.birthdays
			const birthdays = birthdayData.filter((s) => s.date === dateKey)
			birthdays.forEach((s) => {
				this.announce(`Happy birthday to ${s.name}!`, v.chnl_birthday_annc)
			})
		}
	}

	public static async run() {
		cron.schedule(
			"0 0 * * *",
			() => {
				this.birthdayCheck()
			},
			{timezone: Intl.DateTimeFormat().resolvedOptions().timeZone},
		)
		this.logger.log(`I am tasking asf af`)
	}
}
