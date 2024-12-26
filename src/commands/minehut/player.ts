import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, codeBlock } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { minehut } from '../..';
import { DefaultCommandOptions } from '../../utils/discord';
import { ansiRank } from '../../utils/minehut';

@Discord()
export class PlayerCommand {
	@Slash({ name: 'player', description: 'Get a player\'s information', ...DefaultCommandOptions  })
	async player(
		@SlashOption({
			name: 'player',
			description: 'The player to get information about',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		player: string,
		@SlashOption({
            name: 'ephemeral',
            description: 'Whether to send the message as an ephemeral message',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        })
        ephemeral: boolean = true,
		interaction: CommandInteraction,
	) {
		const data = await minehut.players.get(player);
		if (!data) return interaction.reply({ content: 'Player not found', ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle('Player Info')
			.setColor('Blue')
			.addFields([
				{
					name: 'Player',
					value: codeBlock('ansi', ansiRank(data.rank, player)),
					inline: true,
				}
			]);
		
		interaction.reply({ embeds: [embed], ephemeral });
	}
}