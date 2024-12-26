import { REST, Routes } from 'discord.js';
import { secrets } from '../src/config';
import { Client } from 'discordx';

const token = secrets.token;
if (!token) {
    throw new Error('No token provided');
}

export const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'DirectMessages',
        'MessageContent',
    ],
    silent: false,
});

const rest = new REST().setToken(token);

client.login(token);

client.once('ready', async () => {
    const guilds = await client.guilds.fetch();
    for (const [id, guild] of guilds) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands for guild', guild.name))
            .catch(console.error);
    }
});