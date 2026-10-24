import { ButtonInteraction, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import ModalHandler from "../../modal"

export default class HYLAccountLink {

    public readonly id: string
    public readonly uuid: string

    constructor(id: string, uuid: string) {
        this.id = id,
        this.uuid = uuid
    }

    public async manage(interaction: ButtonInteraction, ...args: string[]) {
        const modal = new ModalBuilder().setTitle(`Link your HoyoLab Account`)
        .setCustomId(Buffer.from(`link_${interaction.id}`, "utf-8").toBase64())
        .addLabelComponents(
            new LabelBuilder()
            .setLabel(`Token`)
            .setTextInputComponent(
                new TextInputBuilder()
                .setCustomId(`token`)
                .setPlaceholder(`My token asf af`)
                .setStyle(TextInputStyle.Short),
            ),
            new LabelBuilder()
            .setLabel(`Account Id`)
            .setTextInputComponent(
                new TextInputBuilder()
                .setCustomId(`aid`)
                .setPlaceholder(`My aid asf af`)
                .setStyle(TextInputStyle.Short),
            )

        )
        ModalHandler.addNewModal(`link`, interaction.id)
        return await interaction.showModal(modal)
    }

}