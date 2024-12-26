import { Pagination, PaginationType } from '@discordx/pagination';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { client, guildManager } from '..';
import { config } from '../config';
import { CustomCache } from '../utils/cache';

interface GuildCache {
    id: string;
    memberCount: number;
    invite?: string;
}

const guildsLeaderboardCache = new CustomCache<GuildCache[]>(async () => {
	const guilds = client.guilds.cache
		.filter((guild) => guild.memberCount > 1)
		.sort((a, b) => b.memberCount - a.memberCount)
        .map(async g => {
            const msGuild = await guildManager.get(g.id);
            return {
                id: g.id,
                memberCount: g.memberCount,
                invite: msGuild?.invite
            };
        })
	
	return Promise.all(guilds);
}, 30_000)

@Discord()
export class LeaderboardCommand {
	@Slash({ name: 'leaderboard', description: 'View certain leaderboards' })
	async leaderboard(
		@SlashChoice('guilds')
		@SlashOption({
			name: 'type',
			description: 'The type of leaderboard to view',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		type: LeaderboardType,
		interaction: CommandInteraction
	) {
		if (type == 'guilds') {
			this.sendGuildLeaderboard(interaction, config.discord.ownerIds.includes(interaction.user.id));
		}
	}

	private async sendGuildLeaderboard(interaction: CommandInteraction, includePrivate = false) {
		const guilds = await guildsLeaderboardCache.getCache();
        const filteredGuilds = includePrivate ? guilds : guilds.filter(async g => (await guildManager.get(g.id))?.isPublic() ?? false);
		
		const embeds = [];
		for (let i = 0; i < filteredGuilds.length; i += 15) {
			const embed = new EmbedBuilder()
				.setTitle('Guilds Leaderboard')
				.setDescription(
					filteredGuilds
						.slice(i, i + 15)
						.map((g, index) => {
                            const invite = g.invite && !g.invite.startsWith('https://') ? `https://${g.invite}` : g.invite;
                            const formatted = invite ? `- [Invite](${invite})` : '';
                            return `${index + 1 + i}. ${client.guilds.cache.get(g.id)?.name ?? 'Unknown'} - ${g.memberCount} members ${formatted}`;
                        })
						.join('\n')
				)
				.setColor('Blue')
				.setFooter({
					text: `Page ${i / 15 + 1} of ${Math.ceil(filteredGuilds.length / 15)}`,
				});

			embeds.push(embed);
		}

		const messageOptions = embeds.map(embed => ({ embeds: [embed] }));
		const pagination = new Pagination(interaction, messageOptions, {
			type: PaginationType.Button,
            ephemeral: true,
		});
		pagination.send();
	}
}

type LeaderboardType = 'guilds';