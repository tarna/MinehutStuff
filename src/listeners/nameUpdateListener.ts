import { Discord, On, type ArgsOf } from 'discordx';
import { prisma } from '..';

@Discord()
export class NameUpdateListener {
    @On({ event: 'guildUpdate' })
    async onGuildUpdate([oldGuild, newGuild]: ArgsOf<'guildUpdate'>) {
        if (oldGuild.name === newGuild.name) return;

        await prisma.guild.update({
            where: {
                id: newGuild.id
            },
            data: {
                name: newGuild.name
            }
        });
    }

    @On({ event: 'userUpdate' })
    async onUserUpdate([oldUser, newUser]: ArgsOf<'userUpdate'>) {
        if (oldUser.globalName === newUser.globalName) return;

        await prisma.user.update({
            where: {
                id: newUser.id
            },
            data: {
                name: newUser.globalName
            }
        });
    }
}