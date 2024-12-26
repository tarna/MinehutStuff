export const config = JSON.parse(await Bun.file('config.json').text()) as Config;

export interface Config {
    discord: {
        ownerIds: string[];
        supportServer: string;
        channels: {
            supportDM: string;
            redirectRequests: string;
        };
    }
}

export const secrets = {
    env: process.env.ENV as 'development' | 'production',
    token: process.env.DISCORD_TOKEN as string,
    devGuild: process.env.DEV_GUILD as string,
    logsWebhook: process.env.DISCORD_LOGS_WEBHOOK as string,
}