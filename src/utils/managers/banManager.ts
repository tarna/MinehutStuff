import type { CommandInteraction, Guild, GuildMember, Interaction, User } from 'discord.js';
import { prisma } from '../..';

export class BanManager {
    bannedUsers: Set<string> = new Set();
    bannedGuilds: Set<string> = new Set();
    constructor() {
        this.init();
    }

    private async init() {
        this.bannedUsers = new Set((await prisma.user.findMany({ where: { banned: true } })).map(u => u.id));
        this.bannedGuilds = new Set((await prisma.guild.findMany({ where: { banned: true } })).map(g => g.id));

        console.log(`Loaded ${this.bannedUsers.size} banned users and ${this.bannedGuilds.size} banned guilds.`);
    }

    async banUser(user: User | GuildMember, reason: string) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: { banned: true, bannedReason: reason, bannedAt: new Date() },
            create: { id: user.id, name: user.displayName, banned: true, bannedReason: reason, bannedAt: new Date() }
        });
        this.bannedUsers.add(user.id);
    }

    async unbanUser(user: User | GuildMember) {
        await prisma.user.update({
            where: { id: user.id },
            data: { banned: false, bannedReason: null, bannedAt: null }
        });
        this.bannedUsers.delete(user.id);
    }

    async banGuild(guild: Guild, reason: string) {
        await prisma.guild.upsert({
            where: { id: guild.id },
            update: { banned: true, bannedReason: reason, bannedAt: new Date() },
            create: { id: guild.id, name: guild.name, banned: true, bannedReason: reason, bannedAt: new Date() }
        });
        this.bannedGuilds.add(guild.id);
    }

    async unbanGuild(guild: Guild) {
        await prisma.guild.update({
            where: { id: guild.id },
            data: { banned: false, bannedReason: null, bannedAt: null }
        });
        this.bannedGuilds.delete(guild.id);
    }

    async isUserBanned(user: User | GuildMember) {
        return this.bannedUsers.has(user.id);
    }

    async isGuildBanned(guild: Guild) {
        return this.bannedGuilds.has(guild.id);
    }

    async isInteractionBanned(interaction: CommandInteraction) {
        return this.bannedUsers.has(interaction.user.id) || this.bannedGuilds.has(interaction.guild?.id);
    }
}