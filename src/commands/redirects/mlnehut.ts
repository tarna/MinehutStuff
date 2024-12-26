import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonComponent, Discord, ModalComponent, Slash, SlashOption } from 'discordx';
import { client, prisma } from '../..';
import { listToString } from '../../utils/functions';
import { config } from '../../config';

@Discord()
export class MlnehutCommand {
	@Slash({ name: 'mlnehut', description: 'create a custom redirect under mlnehut.com' })
	async mlnehut(
		@SlashOption({
			name: 'path',
			description: 'the path of the redirect',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		path: string,
		@SlashOption({
			name: 'url',
			description: 'the url to redirect to',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		url: string,
		interaction: CommandInteraction,
	) {
		const data = await prisma.mlnehutRedirect.findUnique({
			where: {
				key: path,
			}
		});

		if (data) return await interaction.reply({ content: `A redirect for https://mlnehut.com/${path} already exists!` });

		const activeRequests = await prisma.mlnehutRequest.findMany({
			where: {
				userId: interaction.user.id,
			}
		});

		if (activeRequests.length > 0) return await interaction.reply({ content: 'You already have an active redirect request! You may only request one at a time.', ephemeral: true });

		const redirectRequest = await prisma.mlnehutRequest.create({
			data: {
				userId: interaction.user.id,
				key: path,
				redirect: !url.startsWith('https://') ? `https://${url}` : url,
			}
		});
		
		const userRedirects = await prisma.mlnehutRedirect.findMany({
			where: {
				userId: interaction.user.id,
			}
		});
		
		const requestEmbed = new EmbedBuilder()
			.setTitle('New Redirect Request')
			.setColor('Blue')
			.setDescription(listToString([
				`A new redirect request has been submitted by ${interaction.user.username}! (${interaction.user.id})`,
				'',
				'Other redirects by this user:',
				...userRedirects.map(redirect => `https://mlnehut.com/${redirect.key} -> ${redirect.redirect}`),
			]))
			.addFields([
				{
					name: 'Path',
					value: path,
					inline: true,
				},
				{
					name: 'URL',
					value: url,
					inline: true,
				}
			]);
		
		const approveButton = new ButtonBuilder()
			.setCustomId(`mlnehut-approve:${redirectRequest.id}`)
			.setLabel('Approve')
			.setStyle(ButtonStyle.Success);
		
		const denyButton = new ButtonBuilder()
			.setCustomId(`mlnehut-deny:${redirectRequest.id}`)
			.setLabel('Deny')
			.setStyle(ButtonStyle.Danger);
		
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton);
		
		const requestChannel = await client.channels.fetch(config.discord.channels.redirectRequests) as TextChannel;
		await requestChannel.send({ embeds: [requestEmbed], components: [row] });

		const replyEmbed = new EmbedBuilder()
			.setTitle('Request Submitted')
			.setColor('Green')
			.setDescription(listToString([
				`Your request for https://mlnehut.com/${path} has been submitted!`,
				'It may take up to 24 hours for your request to be processed.',
				'You will receive a DM about whether or not your request was approved.',
			]));
		interaction.reply({ embeds: [replyEmbed], ephemeral: true });
	}

	@ButtonComponent({ id: /^mlnehut-approve:.*/ })
	async approveRedirect(interaction: ButtonInteraction) {
		const id = interaction.customId.split(':')[1];

		const request = await prisma.mlnehutRequest.findUnique({
			where: {
				id,
			}
		});

		if (!request) return await interaction.reply({ content: 'This request does not exist!', ephemeral: true });
		const user = await client.users.fetch(request.userId);
		if (!user) return await interaction.reply({ content: 'This user cannot be found!', ephemeral: true });

		const redirect = await prisma.mlnehutRedirect.create({
			data: {
				userId: request.userId,
				key: request.key,
				redirect: request.redirect,
			}
		});

		await prisma.mlnehutRequest.delete({
			where: {
				id,
			}
		});

		const replyEmbed = new EmbedBuilder()
			.setTitle('Redirect Approved')
			.setColor('Green')
			.setDescription(listToString([
				`Your request for https://mlnehut.com/${redirect.key} has been approved!`,
				`You may view it [here](https://mlnehut.com/${redirect.key}).`,
			]));
		
		const redirectButton = new ButtonBuilder()
			.setLabel('Redirect')
			.setStyle(ButtonStyle.Link)
			.setURL(`https://mlnehut.com/${redirect.key}`);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(redirectButton);

		await user.send({ embeds: [replyEmbed], components: [row] });

		const messageEmbed = new EmbedBuilder(interaction.message.embeds[0]).setColor('Green');
		interaction.message.edit({ embeds: [messageEmbed], components: [] });

		interaction.reply({ content: 'Redirect approved!', ephemeral: true });
	}

	@ButtonComponent({ id: /^mlnehut-deny:.*/ })
	async denyRedirect(interaction: ButtonInteraction) {
		const id = interaction.customId.split(':')[1];

		const request = await prisma.mlnehutRequest.findUnique({
			where: {
				id,
			}
		});

		if (!request) return await interaction.reply({ content: 'This request does not exist!', ephemeral: true });

		const reasonInput = new TextInputBuilder()
			.setCustomId(`mlnehut-deny-reason`)
			.setLabel('Reason')
			.setPlaceholder('Reason for denial')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);

		const modal = new ModalBuilder()
			.setCustomId(`mlnehut-deny-modal:${id}`)
			.setTitle('Deny Reason')
			.addComponents(row);
		
		interaction.showModal(modal);
	}

	@ModalComponent({ id: /^mlnehut-deny-modal:.*/ })
	async denyRedirectModal(interaction: ModalSubmitInteraction) {
		const id = interaction.customId.split(':')[1];
		const reason = interaction.fields.getTextInputValue('mlnehut-deny-reason');

		const request = await prisma.mlnehutRequest.findUnique({
			where: {
				id,
			}
		});

		if (!request) return await interaction.reply({ content: 'This request does not exist!', ephemeral: true });
		const user = await client.users.fetch(request.userId);
		if (!user) return await interaction.reply({ content: 'This user cannot be found!', ephemeral: true });

		await prisma.mlnehutRequest.delete({
			where: {
				id,
			}
		});

		const replyEmbed = new EmbedBuilder()
			.setTitle('Redirect Denied')
			.setColor('Red')
			.setDescription(listToString([
				`Your request for https://mlnehut.com/${request.key} has been denied!`,
				`Reason: ${reason}`,
			]));

		await user.send({ embeds: [replyEmbed] });

		const messageEmbed = new EmbedBuilder(interaction.message.embeds[0])
			.setColor('Red')
			.addFields({
				name: 'Denial Reason',
				value: reason,
			});
		interaction.message.edit({ embeds: [messageEmbed], components: [] });

		interaction.reply({ content: 'Redirect denied!', ephemeral: true });
	}
}