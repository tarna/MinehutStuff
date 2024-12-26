import type { Guild } from 'discord.js';
import type { Guild as GuildData } from '@prisma/client';
import { prisma } from '../../..';

export class MSGuild {
    id: string;
    guild: Guild;
    data: GuildData;
    constructor(guild: Guild, data: GuildData) {
        this.id = guild.id;
        this.guild = guild;
        this.data = data;
    }

    isPublic() {
        return this.data.public;
    }

    async setPublic(value: boolean) {
        await prisma.guild.update({
            where: {
                id: this.guild.id
            },
            data: {
                public: value
            }
        });
        this.data.public = value;
    }

    
    public get invite() {
        return this.data.invite;
    }

    async setInvite(invite: string | null) {
        await prisma.guild.update({
            where: {
                id: this.guild.id
            },
            data: {
                invite
            }
        });
        this.data.invite = invite;
    }
}