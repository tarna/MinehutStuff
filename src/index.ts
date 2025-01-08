import { importx } from '@discordx/importer';
import { Client } from 'discordx';
import { config, secrets } from './config';
import { ActivityType, IntentsBitField, Partials, PresenceUpdateStatus } from 'discord.js';
import { Minehut } from 'minehut';
import { PrismaClient } from '@prisma/client';
import { BanManager } from './utils/managers/banManager';
import { BannedGuard } from './guards/bannedGuard';
import { GuildManager } from './utils/managers/guild/guildManager';
import { startChannelTrackerJob } from './jobs/channelTrackerJob';
import { logToFile } from './utils/log';

export const minehut = new Minehut();
export const prisma = new PrismaClient();

export const guildManager = new GuildManager();
export const banManager = new BanManager();

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ],
    silent: false,
    botGuilds: secrets.env === 'development' ? [client => client.guilds.cache.map(g => g.id)] : undefined,
    simpleCommand: {
        prefix: 'mh!'
    },
    guards: [BannedGuard]
});

await importx(__dirname + '/{listeners,commands}/**/*.{ts,js}');
const token = secrets.token;
if (!token) {
    throw new Error('No token provided');
}

await client.login(token);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    await client.application?.emojis.fetch();
    await client.initApplicationCommands();

    status();
    setInterval(status, 60000);

    console.log('Loading jobs...');
    startChannelTrackerJob();
});

async function status() {
    const guilds = await client.guilds.fetch();
    client.user?.setPresence({
        status: PresenceUpdateStatus.Online,
        activities: [
            {
                name: `over ${guilds.size} server${guilds.size === 1 ? '' : 's'}`,
                type: ActivityType.Watching
            }
        ]
    })
}

client.on('interactionCreate', async interaction => {
    if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('discordx@pagination@')) return;

    try {
        await client.executeInteraction(interaction);
    } catch (error: any) {
        if (interaction.isRepliable()) {
            await interaction.reply({ content: 'An error occurred while executing this command', ephemeral: true });
        }
        console.error(error);
    }
});

client.on('messageCreate', async message => {
    if (!config.discord.ownerIds.includes(message.author.id)) return;

    client.executeCommand(message);
});

process.on('uncaughtException', (error) => {
    logToFile('errors', error.stack);
});

process.on('unhandledRejection', (error) => {
    logToFile('errors', error.toString());
});

process.on('exit', () => {
    logToFile('errors', 'Process exited');
});