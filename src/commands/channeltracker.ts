import { ApplicationCommandOptionType, ChannelType, CommandInteraction, EmbedBuilder, TextChannel, VoiceChannel } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { minehut, prisma } from '..';
import { listToString } from '../utils/functions';

@Discord()
@SlashGroup({ name: 'channeltracker', description: 'Track server information in a channel name.', defaultMemberPermissions: ['Administrator'] })
export class ChannelTrackerCommand {
    @Slash({ name: 'create', description: 'Create a channel tracker' })
    @SlashGroup('channeltracker')
    async channeltracker(
        @SlashOption({
            name: 'channel',
            description: 'The channel to use',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
            required: true
        })
        channel: TextChannel | VoiceChannel,
        @SlashOption({
            name: 'server',
            description: 'The server to track information for',
            type: ApplicationCommandOptionType.String,
            required: true
        })
        serverName: string,
        @SlashOption({
            name: 'format',
            description: 'The format to name the channel',
            type: ApplicationCommandOptionType.String,
            required: true,
            minLength: 1,
            maxLength: 100
        })
        format: string,
        interaction: CommandInteraction
    ) {
        const trackers = await prisma.channelTracker.findMany({
            where: {
                guildId: channel.guild.id
            }
        });

        if (trackers.length >= 3) return interaction.reply({ content: 'You can only have 3 channel trackers per guild.' });
        
        const server = await minehut.servers.get(serverName);
        if (!server) return interaction.reply({ content: 'Invalid server name.' });

        if (!this.isValidFormat(format)) return interaction.reply({ content: 'Invalid format. You must include {players}, {joins}, or {boosts}.' });

        await prisma.channelTracker.create({
            data: {
                channelId: channel.id,
                guildId: channel.guild.id,
                serverId: server.id,
                format
            }
        });

        const serverData = await minehut.servers.get(serverName);
        const formatted = format.replace('{players}', serverData.playerCount.toString()).replace('{joins}', serverData.joins.toString()).replace('{boosts}', serverData.boosts.toString());
        channel.setName(formatted);

        interaction.reply({ content: `Created channel tracker for server ${server.name} in channel ${channel}.`, ephemeral: true });
    }

    @Slash({ name: 'delete', description: 'Delete a channel tracker' })
    @SlashGroup('channeltracker')
    async delete(
        @SlashOption({
            name: 'channel',
            description: 'The channel to delete the tracker for',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
            required: true
        })
        channel: TextChannel | VoiceChannel,
        interaction: CommandInteraction
    ) {
        const tracker = await prisma.channelTracker.findFirst({
            where: {
                channelId: channel.id
            }
        });

        if (!tracker) return interaction.reply({ content: 'There is no channel tracker for this channel.' });

        await prisma.channelTracker.delete({
            where: {
                id: tracker.id
            }
        });

        interaction.reply({ content: 'Deleted channel tracker.', ephemeral: true });
    }

    @Slash({ name: 'list', description: 'List channel trackers' })
    @SlashGroup('channeltracker')
    async list(interaction: CommandInteraction) {
        const trackers = await prisma.channelTracker.findMany({
            where: {
                guildId: interaction.guild.id
            }
        });

        if (trackers.length === 0) return interaction.reply({ content: 'There are no channel trackers in this guild.' });

        const embed = new EmbedBuilder()
            .setTitle('Channel Trackers')
            .setDescription(
                trackers.map(async (tracker, index) => {
                    const server = await minehut.servers.get(tracker.serverId, false);
                    return listToString([
                        `**${index + 1}.** ${server ? server.name : 'Unknown Server'}`,
                        `**Channel**: <#${tracker.channelId}>`,
                        `**Format**: ${tracker.format}`
                    ]);
                }).join('\n\n')
            )
            .setColor('Blue');
        interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private isValidFormat(format: string) {
        return format.includes('{players}') || format.includes('{joins}') || format.includes('{boosts}');
    }
}