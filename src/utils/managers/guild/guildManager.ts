import type { Guild } from 'discord.js';
import { client, prisma } from '../../..';
import { MSGuild } from './MSGuild';

export class GuildManager {
    async get(guild: Guild | string) {
        const discordGuild = typeof guild === 'string' ? client.guilds.cache.get(guild) : guild;
        const data = await prisma.guild.findFirst({
            where: {
                id: discordGuild.id
            }
        });
        if (!data) {
            const newData = await this.create(discordGuild);
            return new MSGuild(discordGuild, newData);
        }
        return new MSGuild(discordGuild, data);
    }

    async create(guild: Guild) {
        return await prisma.guild.create({
            data: {
                id: guild.id,
                name: guild.name
            }
        });
    }
}