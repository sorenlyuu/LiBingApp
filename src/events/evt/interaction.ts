import {ButtonInteraction, Client, Interaction} from "discord.js"
import Logger from "../../util/log"

export default class InteractionCreateEvent {
	public static buttons: Function[] = []
	public static modals: Function[] = []
	public static readonly logger: Logger = new Logger(`EVTINT`)

	public static async init(client: Client) {
		client.on("interactionCreate", async (interaction: Interaction) => {
			if (interaction.isButton()) {
				for (const s of this.buttons) {
					try {
						await s(interaction)
					} catch (error) {
						this.logger.err(`${error}`)
					}
				}
			} else if (interaction.isModalSubmit()) {
				for (const s of this.modals) {
					try {
						await s(interaction)
					} catch (error) {
						this.logger.err(`${error}`)
					}
				}
			} else {
				this.logger.warn(`Recieved an interaction that is not supported: ${interaction.id}`)
			}
		})
		this.logger.log(`Started!`)
	}

	public static async bindModal(func: Function) {
		this.modals.push(func)
		this.logger.log(`A modal submit event was binded`)
	}

	public static async bindButton(func: Function) {
		this.buttons.push(func)
		this.logger.log(`A button event was binded`)
	}
}
