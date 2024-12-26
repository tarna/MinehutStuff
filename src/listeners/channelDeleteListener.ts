import { Discord, On, type ArgsOf } from 'discordx';
import { prisma } from '..';
import { ChannelType } from 'discord.js';

@Discord()
export class ChannelDeleteListener {
    @On({ event: 'channelDelete' })
    async onChannelDelete([channel]: ArgsOf<'channelDelete'>) {
        if (channel.type != ChannelType.GuildText && channel.type != ChannelType.GuildVoice) return;

        const tracker = await prisma.channelTracker.findFirst({
            where: {
                channelId: channel.id
            }
        });
        if (!tracker) return;

        await prisma.channelTracker.delete({
            where: {
                id: tracker.id
            }
        });
        console.log(`Deleted channel tracker ${tracker.id} for channel ${channel.name} (${channel.id}) in guild ${channel.guild.name} (${channel.guild.id}) because the channel was deleted.`);
    }
}