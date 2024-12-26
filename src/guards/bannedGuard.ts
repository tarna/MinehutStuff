import { CommandInteraction } from 'discord.js';
import { SimpleCommandMessage, type GuardFunction } from 'discordx';
import { banManager } from '..';

export const BannedGuard: GuardFunction<CommandInteraction | SimpleCommandMessage> = async (interaction, client, next) => {
    if (!(interaction instanceof CommandInteraction)) return next();
    const isBanned = await banManager.isUserBanned(interaction.user);
    if (isBanned) {
        if (interaction.isRepliable()) {
            interaction.reply({ content: 'You or the guild you are in has been banned from using this bot.', ephemeral: true });
        }
        return;
    }

    next();
}