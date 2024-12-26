import { Client } from 'discordx';
import { secrets } from '../src/config';
import fs from 'fs/promises';

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'DirectMessages',
        'MessageContent',
    ],
    silent: false,
});

const token = secrets.token;
if (!token) {
    throw new Error('No token provided');
}
await client.login(token);

const icons = await fs.readdir('icons');
const images = await Promise.all(icons.map(icon => fs.readFile(`icons/${icon}`)));

let i = 0;
for (const image of images) {
    const name = icons[images.indexOf(image)].split('.')[0];

    const exists = client.application?.emojis.cache.find(emoji => emoji.name === name);
    if (exists) {
        console.log(`Skipping ${exists.name} because it already exists, ${++i}/${images.length} emojis`);
        continue;
    }

    try {
        await client.application?.emojis.create({
            name,
            attachment: image
        })
        console.log(`Uploaded ${++i}/${images.length} emojis`);
    } catch (error: any) {
        console.log(`Failed to upload ${name}, ${++i}/${images.length} emojis`);
        if (error.toString().includes('exceeds')) {
            console.error(error)
            console.log(`${name} exceeds the limit`);
        }
        continue;
    }
}