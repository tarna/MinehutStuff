import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { minehut } from '../..';
import { listToString } from '../../utils/functions';
import { DefaultCommandOptions } from '../../utils/discord';

@Discord()
export class StatusCommand {
	@Slash({ name: 'status', description: 'View the status of Minehut Services', ...DefaultCommandOptions })
	async status(interaction: CommandInteraction) {
		const data = await minehut.getMinehutStatus()

		const embed = new EmbedBuilder()
			.setTitle('📈 Minehut Status')
			.setColor('Blue')
			.setDescription(listToString([
				`**Minehut Proxy**: ${data.minecraft_proxy}`,
				`**Minehut Java**: ${data.minecraft_java}`,
				`**Minehut Bedrock**: ${data.minecraft_bedrock}`,
				`**Minehut API**: ${data.api}`,
				'',
				'*This information is automatic, please refer to <#240269653358805003> in the Minehut [discord](https://discord.gg/minehut) for status updates*'
			]));
		
		interaction.reply({ embeds: [embed], ephemeral: true })
	}
}