import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { listToString } from '../utils/functions';
import { DefaultCommandOptions } from '../utils/discord';

@Discord()
export class FeaturesCommand {
	@Slash({ name: 'features', description: 'view a list of features', ...DefaultCommandOptions })
	features(interaction: CommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle('Command & Feature List')
			.setColor('Blue')
			.addFields([
				{
					name: 'Commands',
					value: listToString([
						'`/ping` - check the bot\'s latency',
						'`/info` - view information about the bot',
						'`/features` - view this list of commands features',
						'`/player` - view information about a minehut player',
						'`/server` - view information about a minehut server',
						'`/serverlist` - view a list of minehut servers',
						'`/status` - view the status of minehut\'s services',
						'`/network` - view information about the minehut network',
						'`/icons` - view a list of the current server icons in the shop',
                        '`/channeltracker` - track server information in a channel name',
						'`/leaderboard` - view certain leaderboards',
						'`/settings` - edit the guild\'s settings',
					]),
					inline: true,
				},
				{
					name: 'Other Features',
					value: listToString([
						'`/mlnehut` - create a custom redirect under mlnehut.com',
						'`/redirects` - manage your mlnehut.com redirects',
						'',
						'DM the bot to recieve one on one support about the bot or Minehut from our group of knowledgeable staff members!',
					]),
					inline: true,
				}
			])
		
		interaction.reply({ embeds: [embed], ephemeral: true });
	}
}