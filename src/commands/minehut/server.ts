import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder, codeBlock } from 'discord.js';
import { ButtonComponent, Discord, Slash, SlashOption } from 'discordx';
import { minehut } from '../..';
import { DefaultCommandOptions } from '../../utils/discord';
import type { ServerListServer } from 'minehut/dist/server/ServerResponse';
import type { Server } from 'minehut/dist/server/Server';
import { cleanMOTD } from '../../utils/minehut';
import { listToString } from '../../utils/functions';

let serverListCache: {
	lastUpdate: number;
	servers: ServerListServer[];
} = { lastUpdate: 0, servers: [] };

@Discord()
export class ServerCommand {
	constructor() {
		setTimeout(() => this.updateCache(), 10000);
	}

	@Slash({ name: 'server', description: 'Get a server\'s information', ...DefaultCommandOptions })
	async server(
		@SlashOption({
			name: 'server',
			description: 'The server to get information about',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		server: string,
        @SlashOption({
            name: 'ephemeral',
            description: 'Whether to send the message as an ephemeral message',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        })
        ephemeral: boolean = true,
		interaction: CommandInteraction,
	) {
		this.updateCache();
		const { embeds, components, data } = await this.getServerMessage(server);
		if (!data || !components || !embeds) return interaction.reply({ content: 'Server not found', ephemeral: true });
		
		if (data.online) return interaction.reply({ embeds, components, ephemeral });
		interaction.reply({ embeds, ephemeral });
	}

	@ButtonComponent({ id: /^update-server:.+$/ })
	async updateServer(interaction: ButtonInteraction) {
		const server = interaction.customId.split(':')[1];
		const { embeds, components, data } = await this.getServerMessage(server);
		if (!data || !components || !embeds) return interaction.reply({ content: 'Server not found', ephemeral: true });

		if (data.online) return interaction.update({ embeds, components });
		interaction.update({ embeds });
	}

	private async getServerMessage(server: string): Promise<{ embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[]; data: Server } | null> {
		const data = await minehut.servers.get(server);
		if (!data) return null;

		let startTime: number | null = Math.floor(data.lastOnline.getTime() / 1000);
		const creationDate = Math.floor(data.createdAt.getTime() / 1000);

		const maxPlayers = data.proxy ? undefined : data.maxPlayers || 10;
		const status = data.suspended ? `suspended` : data.online ? 'online' : 'offline';
		if (!startTime || isNaN(startTime) || new Date(startTime).getTime() == -1)
			startTime = creationDate;
		const plan = data.prettyPlan;
		const icons = await data.getPurchasedIcons();

		const motd = codeBlock(cleanMOTD(data.motd));
		const serverListServer = serverListCache.servers.find((s) => s.name.toLowerCase() == server.toLowerCase());
		const owner = serverListServer ? serverListServer.author : undefined

		const description = listToString([
			data.suspended ? '⚠️ This server is suspended' : undefined,
			motd,
			`📈 Players: ${data.playerCount}${maxPlayers !== undefined ? `/${maxPlayers}` : ''} (Total Joins: ${data.joins})`,
			`📁 Categories: ${data.categories.length == 0 ? 'None' : data.categories.join(', ')}`,
			owner ? `👑 Owner: ${owner}` : undefined,
            plan === 'Starter' ? `🚀 Boosts: ${data.boosts}` : undefined
		]);

		const embed = new EmbedBuilder()
			.setTitle(data.name)
			.setColor(data.online ? 'Green' : 'Red')
			.setDescription(description)
			.addFields([
				{
					name: 'Server Status',
					value: listToString([
						`Server is \`${status}\` ${data.online ? '✅' : '❌'}`,
						`${data.online ? `Started` : `Last Online`} <t:${startTime}:R>`,
						`Created <t:${creationDate}:R>`
					]),
					inline: true,
				},
				{
					name: 'Server Information',
					value: listToString([
						`The server is using ${plan === 'CUSTOM' ? 'a' : 'the'} \`${plan} plan\``,
						`Price: ${Math.round(data.creditsPerDay)} credits/day`,
						`Icons Unlocked: ${icons.map((icon) => icon.displayName).join(', ')}`,
					]),
					inline: true,
				}
			])
		
		const updateButton = new ButtonBuilder()
			.setCustomId(`update-server:${data.name}`)
			.setLabel('Update')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('🔄');
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(updateButton);
		
		return {
			embeds: [embed],
			components: [row],
			data,
		}
	}

	private async updateCache() {
		if (Date.now() - serverListCache.lastUpdate < 30_000) return;
		serverListCache = {
			lastUpdate: Date.now(),
			servers: await minehut.servers.getOnlineServers(),
		};
	}
}