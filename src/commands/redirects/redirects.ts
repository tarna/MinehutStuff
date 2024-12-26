import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { listToString } from '../../utils/functions';
import { client, prisma } from '../..';

@Discord()
@SlashGroup({ name: 'redirects', description: 'manage your mlnehut.com redirects' })
export class RedirectsCommand {
	@Slash({ name: 'list', description: 'view a list of your redirects' })
	@SlashGroup('redirects')
	async listRedirects(interaction: CommandInteraction) {
		const redirects = await prisma.mlnehutRedirect.findMany({
			where: {
				userId: interaction.user.id,
			}
		});

		if (redirects.length === 0) return await interaction.reply({
			content: listToString([
				'You don\'t have any redirects!',
				'You can create one with `/mlnehut` command.',
		]), ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle('Your Redirects')
			.setColor('Blue')
			.setDescription(listToString(
				redirects.map(redirect => `https://mlnehut.com/${redirect.key} -> ${redirect.redirect} (Uses: ${redirect.uses})`)
			));

		await interaction.reply({ embeds: [embed], ephemeral: true });
	}

	@Slash({ name: 'delete', description: 'delete one of your redirects' })
	@SlashGroup('redirects')
	async deleteRedirects(
		@SlashOption({
			name: 'path',
			description: 'the path of the redirect to delete',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		path: string,
		interaction: CommandInteraction
	) {
		const redirects = await prisma.mlnehutRedirect.findMany({
			where: {
				userId: interaction.user.id,
			}
		});

		if (redirects.length === 0) return await interaction.reply({
			content: listToString([
				'You don\'t have any redirects!',
				'You can create one with `/mlnehut` command.',
		]), ephemeral: true });

		const redirect = redirects.find(redirect => redirect.key === path);
		if (!redirect) return await interaction.reply({ content: `You don't have a redirect for <https://mlnehut.com/${path}>!`, ephemeral: true });

		await prisma.mlnehutRedirect.delete({
			where: {
				id: redirect.id,
			}
		});

		await interaction.reply({ content: `Successfully deleted your redirect for <https://mlnehut.com/${path}>!`, ephemeral: true });
	}
}