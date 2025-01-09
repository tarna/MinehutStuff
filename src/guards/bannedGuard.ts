import { CommandInteraction } from 'discord.js';
import { SimpleCommandMessage, type GuardFunction } from 'discordx';
import { banManager } from '..';
import { listToString } from '../utils/functions';
import { config } from '../config';

export const BannedGuard: GuardFunction<CommandInteraction | SimpleCommandMessage> = async (interaction, client, next) => {
    if (!(interaction instanceof CommandInteraction)) return next();
    const guildBanned = await banManager.isGuildBanned(interaction.guild);
    if (guildBanned) {
        if (interaction.isRepliable()) {
            interaction.reply({ content: listToString([
                'This guild has been banned from using this bot.',
                `If you believe this is a mistake, please ${interaction.user.id !== interaction.guild.ownerId ? 'ask the guild owner to' : ''} create a ticket in the [support server](${config.discord.supportServer}).`
            ]), ephemeral: true });
        }
        return;
    }

    const isBanned = await banManager.isUserBanned(interaction.user);
    if (isBanned) {
        if (interaction.isRepliable()) {
            interaction.reply({ content: listToString([
                'You have been banned from using this bot.',
                `If you believe this is a mistake, please create a ticket in the [support server](${config.discord.supportServer}).`
            ]), ephemeral: true });
        }
        return;
    }

    next();
}