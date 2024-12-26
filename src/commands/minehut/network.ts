import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { minehut } from '../..';
import { formatNumber, listToString } from '../../utils/functions';
import { DefaultCommandOptions } from '../../utils/discord';

@Discord()
export class StatsCommand {
	@Slash({ name: 'network', description: 'View statistics about Minehut', ...DefaultCommandOptions })
	async stats(
        @SlashOption({
            name: 'ephemeral',
            description: 'Whether to send the message as an ephemeral message',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        })
        ephemeral: boolean = true,
        interaction: CommandInteraction
    ) {
		const data = {
            ...await minehut.getPlayerDistribution(),
            ...await minehut.getSimpleStats(),
        }

		const embed = new EmbedBuilder()
			.setTitle('📊 Network Stats')
			.setColor('Blue')
			.setDescription(listToString([
				`**Players**: ${formatNumber(data.playerCount)}`,
				`→ Java: ${formatNumber(data.java.total)} *(Lobby: ${formatNumber(data.java.lobby)}, Servers: ${formatNumber(data.java.playerServer)})*`,
				`→ Bedrock: ${formatNumber(data.bedrock.total)} *(Lobby: ${formatNumber(data.bedrock.lobby)}, Servers: ${formatNumber(data.bedrock.playerServer)})*`,
				'',
				`**Servers**: ${data.serverCount}/${data.serverMax}`,
				`**RAM**: ${Math.round(data.ramCount / 1000)}GB`,
				'',
				'*View player statistics at [Minehut Track](https://track.gamersafer.systems)*'
			]));
		
		interaction.reply({ embeds: [embed], ephemeral });
	}
}