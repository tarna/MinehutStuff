import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import { banManager, prisma } from '../..';

@Discord()
export class BanCommand {
    @SimpleCommand({ name: 'ban', description: 'Ban a user or guild.' })
    async ban(
        @SimpleCommandOption({
            name: 'type',
            type: SimpleCommandOptionType.String,
            description: 'User or Guild',
        })
        type: 'user' | 'guild',
        @SimpleCommandOption({
            name: 'id',
            type: SimpleCommandOptionType.String,
            description: 'User or Guild ID',
        })
        id: string,
        @SimpleCommandOption({
            name: 'reason',
            type: SimpleCommandOptionType.String,
            description: 'Reason for ban',
        })
        reason: string,
        command: SimpleCommandMessage
    ) {
        if (!type) {
            return command.message.reply('Invalid type. Must be either `user` or `guild`.');
        }

        if (!['user', 'guild'].includes(type.toLowerCase())) {
            return command.message.reply('Invalid type. Must be either `user` or `guild`.');
        }

        if (!id) {
            return command.message.reply('Invalid ID.');
        }

        if (type.toLowerCase() === 'user') {
            const data = await prisma.user.findFirst({
                where: {
                    id
                }
            });
            if (!data) {
                return command.message.reply('User not found.');
            }

            const user = await command.message.client.users.fetch(id);
            if (!user) {
                return command.message.reply('Failed to find user.');
            }

            await banManager.banUser(user, reason);

            return command.message.reply(`User ${data.name} (${id}) has been banned.`);
        } else if (type.toLowerCase() === 'guild') {
            const data = await prisma.guild.findFirst({
                where: {
                    id
                }
            });
            if (!data) {
                return command.message.reply('Guild not found.');
            }

            const guild = await command.message.client.guilds.fetch(id);

            if (!guild) {
                return command.message.reply('Failed to find guild.');
            }

            await banManager.banGuild(guild, reason);

            return command.message.reply(`Guild ${data.name} (${id}) has been banned.`);
        } else {
            return command.message.reply('Invalid type. Must be either `user` or `guild`.');
        }
    }
}