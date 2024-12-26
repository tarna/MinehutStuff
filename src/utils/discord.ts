import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';

export const AllContexts = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];
export const AllIntegrationTypes = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];

export const DefaultCommandOptions = {
    contexts: AllContexts,
    integrationTypes: AllIntegrationTypes,
}