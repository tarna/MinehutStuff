import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { listToString } from '../utils/functions';
import { config } from '../config';

@Discord()
export class InfoCommand {
	@Slash({ name: 'info', description: 'Get info about the bot' })
	async info(interaction: CommandInteraction) {
		const creator = interaction.guild.members.cache.get(config.discord.ownerIds[0]);
		const embed = new EmbedBuilder()
			.setTitle('Info')
			.setColor('Blue')
			.setDescription(listToString([
				'**MinehutStuff** is a bot that has many useful commands for Minehut.',
				'Use `/features` to see a full list of all the commands and features.',
				`Join the support server [here](${config.discord.supportServer})`,
				'',
				'Please vote for the bot on [top.gg](https://top.gg/bot/1028454779850080366) to help it grow!',
				'If You\'d like to support keep the bot up and running, you can support the bot by donating [here](https://github.com/sponsors/tarna).'
			]))
			.setTimestamp()
			.addFields([
				{
					name: 'Creator',
					value: creator ? creator.toString() : '`tarna256`',
					inline: true,
				},
				{
					name: 'Uptime',
					value: `<t:${Math.floor(interaction.client.readyTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: 'Servers',
					value: interaction.client.guilds.cache.size.toString(),
					inline: true,
				},
                {
                    name: 'Code',
                    value: '[Github](https://github.com/tarna/MinehutStuff)',
                    inline: true
                }
			]);
		
			const supportButton = new ButtonBuilder()
				.setLabel('Support Server')
				.setStyle(ButtonStyle.Link)
				.setURL(config.discord.supportServer);
			
			const voteButton = new ButtonBuilder()
				.setLabel('Vote')
				.setStyle(ButtonStyle.Link)
				.setURL('https://top.gg/bot/1028454779850080366');
			
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(supportButton, voteButton);
			
			interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	}
}