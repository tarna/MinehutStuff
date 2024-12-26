import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, EmbedBuilder, ForumChannel } from 'discord.js';
import { type ArgsOf, ButtonComponent, Discord, On } from 'discordx';
import { client, prisma } from '..';
import { listToString } from '../utils/functions';
import { config } from '../config';

const acceptedCache: string[] = [];

@Discord()
export class DMListener {
	@On({ event: 'messageCreate' })
	async onDM([message]: ArgsOf<'messageCreate'>) {
		if (message.channel.type !== ChannelType.DM) return;
		if (message.author.bot) return;

		const data = await prisma.user.findFirst({
			where: {
				id: message.author.id
			}
		});

		if (!data || !data.acceptedTerms) {
			const embed = new EmbedBuilder()
				.setTitle('Accept the TOS')
				.setColor('Blue')
				.setDescription(listToString([
					'To use the DM support system, you must accept the the following terms first.',
					'Once you accept, please resend your message.',
					'',
					'- You may not spam messages in the DM support system.',
					'- You may not send any inappropriate content in the DM support system.',
					'- You may not send any content that violates Discord\'s Terms of Service.',
					'- You may not send any content that violates the Minehut Terms of Service.',
					'- Do not send any personal information in the DM support system.',
					'',
					'_Note: We are not affiliated with Minehut. For official support, create a ticket [here](https://support.minehut.com)_.',
					'',
					'Failure to follow these rules will result in a ban from the **entire** bot.'
				]));
			
			const button = new ButtonBuilder()
				.setCustomId('accept_tos')
				.setLabel('Accept')
				.setStyle(ButtonStyle.Primary);
			const privacyPolicy = new ButtonBuilder()
				.setLabel('Privacy Policy')
				.setStyle(ButtonStyle.Link)
				.setURL('https://minehutstuff.vercel.app/privacy')
				.setEmoji('🔒');
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button, privacyPolicy);

			return message.channel.send({ embeds: [embed], components: [row] });
		}

		const threadData = await prisma.supportDM.findFirst({
			where: {
				userId: message.author.id
			}
		});

		const forumChannel = client.channels.cache.get(config.discord.channels.supportDM) as ForumChannel;
		if (!forumChannel) return message.reply('Failed to find support channel');

		if (!threadData) {
			const embed = new EmbedBuilder()
				.setColor('Blue')
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL()
				})
				.setFooter({ text: `ID: ${message.author.id}` });
			if (message.content) embed.setDescription(message.content);
			
			const thread = await forumChannel.threads.create({
				message: { embeds: [embed], files: message.attachments.map((attachment) => attachment.url) },
				name: message.author.tag,
				reason: 'Support DM'
			});

			await prisma.supportDM.create({
				data: {
					userId: message.author.id,
					threadId: thread.id
				}
			});
		} else {
			const thread = await forumChannel.threads.fetch(threadData.threadId);
			if (!thread) return message.reply('Failed to find support thread');

			const embed = new EmbedBuilder()
				.setColor('Blue')
				.setAuthor({
					name: message.author.username,
					iconURL: message.author.displayAvatarURL()
				})
				.setFooter({ text: `ID: ${message.author.id}` });
			if (message.content) embed.setDescription(message.content);
			thread.send({ embeds: [embed], files: message.attachments.map((attachment) => attachment.url) });
		}
	}

	@On({ event: 'messageCreate' })
	async supportMessage([message]: ArgsOf<'messageCreate'>) {
		if (message.channel.type !== ChannelType.PublicThread) return;
		if (message.author.bot) return;
		if (message.channel.parentId !== config.discord.channels.supportDM) return;

		const threadData = await prisma.supportDM.findFirst({
			where: {
				threadId: message.channelId
			}
		});

		if (!threadData) return;

		const user = await client.users.fetch(threadData.userId);
		if (!user) return message.reply('Failed to find user');

		const embed = new EmbedBuilder()
			.setColor('Blue')
			.setAuthor({
				name: message.author.username,
				iconURL: message.author.displayAvatarURL()
			});
		if (message.content) embed.setDescription(message.content);

		user.send({
			embeds: [embed],
			files: message.attachments.map((attachment) => attachment.url)
		});
	
	}

	@ButtonComponent({ id: 'accept_tos' })
	async acceptTOS(interaction: ButtonInteraction) {
		if (acceptedCache.includes(interaction.user.id)) return interaction.reply({ content: 'You have already accepted the TOS', ephemeral: true });

		const data = await prisma.user.findFirst({
			where: {
				id: interaction.user.id
			}
		});

		if (data) {
			acceptedCache.push(interaction.user.id);
			interaction.reply({ content: 'You have accepted the TOS!', ephemeral: true  })
			return await prisma.user.update({
				where: {
					id: interaction.user.id
				},
				data: {
					acceptedTerms: true
				}
			});
		}

		await prisma.user.create({
			data: {
				id: interaction.user.id,
                name: interaction.user.globalName,
				acceptedTerms: true
			}
		});
		acceptedCache.push(interaction.user.id);

		await interaction.reply({
			content: listToString([
				'You have accepted the TOS.',
				'Please resend your message.'
		]), ephemeral: true });
	}
}