import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Pagination, PaginationType } from '@discordx/pagination';
import { minehut } from '../..';
import { DefaultCommandOptions } from '../../utils/discord';
import type { ServerListServer } from 'minehut/dist/server/ServerResponse';

let categoriesCache: { lastUpdate: number, categories: string[] } = { lastUpdate: 0, categories: [] };

@Discord()
export class ServerListCommand {
	constructor() {
		this.updateCache();
	}

	@Slash({ name: 'serverlist', description: 'View the Minehut server list', ...DefaultCommandOptions })
	async serverlist(
		@SlashOption({
			name: 'category',
			type: ApplicationCommandOptionType.String,
			description: 'The category to view',
			required: false,
			autocomplete: async (interaction: AutocompleteInteraction) => {
				const categories = categoriesCache.categories.filter((category) => category.toLowerCase().startsWith(interaction.options.getFocused()));
				interaction.respond(categories.slice(0, 25).map((category) => {
					return {
						name: category,
						value: category
					};
				}));
			}
		})
		category: string,
		@SlashOption({
			name: 'server',
			type: ApplicationCommandOptionType.String,
			description: 'The server to view the position of',
			required: false
		})
		server: string,
		interaction: CommandInteraction
	) {
		this.updateCache();
		let servers = await minehut.servers.getOnlineServers();
		if (!servers) return interaction.reply({ content: 'Failed to fetch servers', ephemeral: true });
		if (category) {
			category = category.toLowerCase();
			servers = servers.filter((server: ServerListServer) => server.allCategories.includes(category));
		}

		const embeds = [];
		for (let i = 0; i < servers.length; i += 10) {
			const embed = new EmbedBuilder()
				.setTitle(`${category ? category : ''} Server List`)
				.setColor('Blue')
				.setFooter({
					text: `Page ${Math.floor(i / 10) + 1}/${Math.ceil(servers.length / 10)}`
				})
				.addFields(
					servers.slice(i, i + 10).map((server: any, index: number) => {
						return {
							name: `${index + i + 1}. ${server.name}`,
							value: `${server.playerData.playerCount}/${server.maxPlayers}`,
							inline: true
						};
					})
				);
			embeds.push(embed);
		}

		if (server) {
			const serverPosition = servers.findIndex((s) => s.name.toLowerCase() == server.toLowerCase());
			if (serverPosition != -1) {
				if (serverPosition > 9) {
					embeds[0].addFields({
                        name: `${serverPosition + 1}. ${server}`,
                        value: `${servers[serverPosition].playerData.playerCount}/${servers[serverPosition].maxPlayers}`,
                        inline: true
                    });
				}
			}
		}

		const messageOptions = embeds.map(embed => ({ embeds: [embed] }));
		const pagination = new Pagination(interaction, messageOptions, {
			type: PaginationType.Button,
			ephemeral: true
		});
		pagination.send();
	}

	private async updateCache() {
		if (Date.now() - categoriesCache.lastUpdate < 30_000) return;

		const categories = await minehut.servers.getServerCategories();
		categoriesCache = {
			lastUpdate: Date.now(),
			categories: categories.map((category) => category.friendly_name)
		};
	}
}