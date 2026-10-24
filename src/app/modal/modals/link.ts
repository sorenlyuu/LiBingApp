import {ButtonInteraction, LabelBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle, User} from "discord.js"
import UserData from "../../../res/user"

export default class HYLAccountLink {
	public readonly id: string
	public readonly intId: string

	constructor(id: string, intId: string) {
		;((this.id = id), (this.intId = intId))
	}

	public async manage(interaction: ModalSubmitInteraction) {
		const token = interaction.fields.getTextInputValue(`token`)
		const aid = interaction.fields.getTextInputValue(`aid`)
		const user = await UserData.get(interaction.user.id)

		if (!user) return interaction.reply(`Something went wrong, try again later`)
		user.HoyoLabAuthToken = token
		user.HoyoLabAccountId = aid
		
		await UserData.save(user, interaction.user.id)
		return await interaction.reply(`Linked!`)
	}
}
