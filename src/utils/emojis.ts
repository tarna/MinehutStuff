import { client } from '..';

export function getIconEmoji(name: string) {
    if (name.includes('CAVE_VINES_PLANT')) {
        name = 'CAVE_VINES';
    }
    return client.application?.emojis.cache.find(emoji => emoji.name === name.toLowerCase());
}