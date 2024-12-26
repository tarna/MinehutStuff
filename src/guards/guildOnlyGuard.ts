import type { CommandInteraction } from 'discord.js';
import type { GuardFunction } from 'discordx';

export const GuildOnlyGuard: GuardFunction<CommandInteraction> = async (interaction, client, next) => {
    if (interaction.guild) {
        return next();
    }
    interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });
}