import BotApplication from "../../../object/client"
import AppResources from "../../../res/app"
import {ServerConfig} from "../../../types/servercfg"
import Logger from "../../../util/log"
import cron from "node-cron"
export default class BirthdayTask {
	private  static readonly logger: Logger = new Logger(`BIRTHDAYTASK`)

	public static async announce(app: BotApplication, msg: string, channelId: string) {
		const channel = await app.client.channels.fetch(channelId)
		if (!channel) return
		if (channel.isSendable()) {
			channel.send(msg)
			this.logger.log(`Announced birthday:\n${msg}`)
		}
		return
	}

	public static async birthdayCheck(app: BotApplication) {
		const date = new Date()
		const day = String(date.getDate()).padStart(2, `0`)
		const month = String(date.getMonth() + 1).padStart(2, `0`)
		const dateKey = `${day}/${month}`
		const servers: ServerConfig = AppResources.get(`servercfg`)
		for (const [i, v] of Object.entries(servers)) {
			const birthdayData = v.birthdays
			const birthdays = birthdayData.filter((s) => s.date === dateKey)
			birthdays.forEach((s) => {
				this.announce(app, `Happy birthday to ${s.name}!`, v.chnl_birthday_annc)
			})
		}
	}

	public static async run(app: BotApplication) {
		cron.schedule(
			"0 0 * * *",
			() => {
				this.birthdayCheck(app)
			},
			{timezone: Intl.DateTimeFormat().resolvedOptions().timeZone},
		)
		this.logger.log(`I am tasking asf af`)
	}
}
