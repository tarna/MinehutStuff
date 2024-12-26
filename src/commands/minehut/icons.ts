import { ButtonComponent, Discord, Slash, SlashOption } from 'discordx';
import { DefaultCommandOptions } from '../../utils/discord';
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, type CommandInteraction } from 'discord.js';
import { minehut } from '../..';
import { getIconEmoji } from '../../utils/emojis';
import { Pagination, PaginationType } from '@discordx/pagination';

@Discord()
export class IconCommand {
    @Slash({ name: 'icons', description: 'View the current and future icons in the Minehut shop', ...DefaultCommandOptions })
    async icons(
        @SlashOption({
            name: 'ephemeral',
            description: 'Whether to send the message as an ephemeral message',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        })
        ephemeral: boolean = true,
        interaction: CommandInteraction
    ) {
        const icons = await minehut.icons.fetchAvailable();
        const current = icons.available.icons;
        const upcoming = icons.upcoming.icons;

        const embed = new EmbedBuilder()
            .setTitle('Minehut Icons')
            .setColor('Blue')
            .setTimestamp()
            .setFields([
                {
                    name: 'Current',
                    value: current.map(icon => {
                        const emoji = getIconEmoji(icon.icon_name);
                        return `${emoji} ${icon.display_name}`;
                    }).join('\n'),
                    inline: true
                },
                {
                    name: 'Upcoming',
                    value: upcoming.map(icon => {
                        const emoji = getIconEmoji(icon.icon_name);
                        return `${emoji} ${icon.display_name}`;
                    }).join('\n'),
                    inline: true
                },
                {
					name: 'Data',
					value: `Next cycle starts <t:${Math.floor(icons.available.active_end_time / 1000)}:R>`,
				}
            ])
        
        const allIconsButton = new ButtonBuilder()
            .setCustomId('all_icons')
            .setLabel('All Icons')
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(allIconsButton);
        
        interaction.reply({ embeds: [embed], components: [row], ephemeral });
    }

    @ButtonComponent({ id: 'all_icons' })
    async allIcons(interaction: ButtonInteraction) {
        const allIcons = await minehut.icons.fetchAll();

        const embeds = [];
        for (let i = 0; i < allIcons.length; i += 10) {
            const embed = new EmbedBuilder()
                .setTitle('All Minehut Icons')
                .setColor('Blue')
                .setTimestamp()
                .setDescription(allIcons.slice(i, i + 10).map(icon => {
                    const emoji = getIconEmoji(icon.iconName.toLowerCase());
                    return `${emoji} ${icon.displayName}`;
                }).join('\n'));
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