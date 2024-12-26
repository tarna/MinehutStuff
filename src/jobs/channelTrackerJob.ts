import { CronJob } from 'cron';
import { client, minehut, prisma } from '..';
import { ChannelType } from 'discord.js';

const job = new CronJob('*/5 * * * *', async () => {
    console.log('Running channel tracker job...');
    const trackers = await prisma.channelTracker.findMany();

    for (const tracker of trackers) {
        const server = await minehut.servers.get(tracker.serverId, false);

        const guild = await client.guilds.fetch(tracker.guildId);
        if (!guild) return console.error(`Tracker ${tracker.id} has an invalid guild: ${tracker.guildId}`);

        const channel = await guild.channels.fetch(tracker.channelId);
        if (!channel) return console.error(`Tracker ${tracker.id} has an invalid channel: ${tracker.channelId}`);

        if (channel.type != ChannelType.GuildText && channel.type != ChannelType.GuildVoice) return console.error(`Tracker ${tracker.id} has an invalid channel type: ${channel.type}`);

        let format = tracker.format;
        format = format.replace('{players}', server.playerCount.toString());
        format = format.replace('{joins}', server.joins.toString());
        format = format.replace('{boosts}', server.boosts.toString());

        await channel.setName(format);
        console.log(`Updated channel tracker ${tracker.id} for channel ${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id}) with format ${format}`);
    }
});

export function startChannelTrackerJob() {
    console.log('Starting channel tracker job...');
    job.start();
}