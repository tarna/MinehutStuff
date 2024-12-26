import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { client } from '..';

@Discord()
export class PingCommand {
	@Slash({
		name: 'ping',
		description: 'Pong!',
	})
	async ping(interaction: CommandInteraction) {
		const msg = await interaction.reply({ content: 'Ping?', ephemeral: true, fetchReply: true });
		const diff = msg.createdTimestamp - interaction.createdTimestamp;
		const ping = Math.round(client.ws.ping);
		return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
	}
}