import { ButtonComponent, Discord, Guard, ModalComponent, Slash } from 'discordx';
import { GuildOnlyGuard } from '../guards/guildOnlyGuard';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle, type CommandInteraction, type InteractionReplyOptions } from 'discord.js';
import { guildManager } from '..';
import type { MSGuild } from '../utils/managers/guild/MSGuild';
import { listToString } from '../utils/functions';

@Discord()
@Guard(GuildOnlyGuard)
export class SettingsCommand {
    @Slash({ name: 'settings', description: 'Edit guild settings', defaultMemberPermissions: ['Administrator'] })
    async settings(interaction: CommandInteraction) {
        const guild = await guildManager.get(interaction.guild!);

        const message = this.createMessage(guild);
        interaction.reply({ ...message, ephemeral: true });
    }

    private createMessage(guild: MSGuild): InteractionReplyOptions {
        const isPublic = guild.isPublic();
        const embed = new EmbedBuilder()
            .setTitle('Settings')
            .setColor('Blue')
            .setDescription(listToString([
                `Public: ${isPublic ? 'Yes' : 'No'}`,
                `Invite: ${guild.invite ?? 'None'}`
            ]));
        
        const publicButton = new ButtonBuilder()
            .setCustomId(`public:${!isPublic}`)
            .setLabel(`Set to ${!isPublic ? 'public' : 'private'}`)
            .setStyle(isPublic ? ButtonStyle.Danger : ButtonStyle.Success);

        const setInviteButton = new ButtonBuilder()
            .setCustomId('set_invite')
            .setLabel('Set Invite')
            .setStyle(ButtonStyle.Primary);
        
        const removeInviteButton = new ButtonBuilder()
            .setCustomId('remove_invite')
            .setLabel('Remove Invite')
            .setStyle(ButtonStyle.Danger);
        
        const buttons = [publicButton, setInviteButton];
        if (guild.invite) buttons.push(removeInviteButton);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
        
        return { embeds: [embed], components: [row] };
    }

    @ButtonComponent({ id: /^public:/ })
    async publicButton(interaction: ButtonInteraction) {
        const [_, isPublic] = interaction.customId.split(':');
        const guild = await guildManager.get(interaction.guild!);

        await guild.setPublic(isPublic === 'true');

        const message = this.createMessage(guild);
        interaction.update({ embeds: message.embeds, components: message.components });
    }

    @ButtonComponent({ id: 'set_invite' })
    async createInviteButton(interaction: ButtonInteraction) {
        const inviteInput = new TextInputBuilder()
            .setCustomId('invite')
            .setLabel('Invite')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const modal = new ModalBuilder()
            .setCustomId('invite_modal')
            .setTitle('Invite')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(inviteInput)
            );
        interaction.showModal(modal);
    }

    @ModalComponent({ id: 'invite_modal' })
    async inviteModal(interaction: ModalSubmitInteraction) {
        const invite = interaction.fields.getTextInputValue('invite');
        const guild = await guildManager.get(interaction.guild!);

        if (!invite.startsWith('https://discord.gg/') && !invite.startsWith('discord.gg/')) {
            return interaction.reply({ content: 'Invalid invite URL.', ephemeral: true });
        }

        await guild.setInvite(invite);

        const message = this.createMessage(guild);
        if (interaction.isFromMessage()) interaction.update({ embeds: message.embeds, components: message.components });
    }

    @ButtonComponent({ id: 'remove_invite' })
    async removeInviteButton(interaction: ButtonInteraction) {
        const guild = await guildManager.get(interaction.guild!);
        await guild.setInvite(null);

        const message = this.createMessage(guild);
        interaction.update({ embeds: message.embeds, components: message.components });
    }
}