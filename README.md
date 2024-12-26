# MinehutStuff
MinehutStuff is a Discord bot with many different custom features relating to [Minehut](https://minehut.com).

_Note: Parts of this code base is still being cleaned up while it is preparing to be open sourced._

## Installation
This bot is created using [bun](https://bun.sh) so want to run it yourself, it is recommended to use that as well.
```sh
bunx prisma generate
bun start
```

## Config
The bot has config in two different places. Secret information is configured in the `.env` file while general information is configured in the `config.json` file.

Copy over the `.env.example` file to `.env` and `config.example.json` to `config.json`.

## Libraries
- [discord.js](https://discord.js.org) - Library to interact with Discord and create the bot.
- [discordx](https://discordx.js.org) - Library to handle Discord interactions such as commands, buttons, modals, and more.
- [minehut](https://www.npmjs.com/package/minehut) - Library to fetch information from the Minehut API. (Also maintained by me)
- [prisma](https://www.prisma.io) - Library used to store data with MongoDB.
- [cron](https://www.npmjs.com/package/cron) - Cron library to create recurring tasks.

## Commands
### Minehut
- `/icons` - Displays a list of the current and upcoming icons in the [Minehut Store](https://app.minehut.com/shop/icons).
- `/network` - Displays information about the Minehut Network.
- `/player` - Displays the rank of a Minehut player.
- `/server` - Displays information about a Minehut server.
- `/serverlist` - Displays the top servers on Minehut with an optional category filter.
- `/status` - Displays the status of the Minehut Network.

### Redirects
- `/mlnehut` - Ability to create a custom redirect on the `mlnehut.com` domain.
- `/redirects` - See a list of your `mlnehut.com` redirects.

### Other
- `/channeltracker` - Create a tracker to display information about a Minehut server in a channel name. Currently supports player count, joins, and boosts.
- `/features` - Displays a list of the bot's features.
- `/info` - See information about the bot MinehutStuff.
- `/leaderboard` - See a leaderboard of all servers using the bot.
- `/ping` - Check the ping with the bot.
- `/settings` - Change the bot's guild settings.

### Owneer
- `mh!ban <user|guild> <id> <reason>` - Command that is only available to the bot owner to ban users or guilds that are misusing the bot.

## Other Features
- Get private support with the bot's staff by sending a DM to the bot.

## Icons
The icons command uses an emoji of each icon that is uploaded to the bot as an application emoji. You can find all the images for the icons in the icons directory or use the [download icons script](./scripts/iconsDownload.ts) to download them yourself. And then upload it manually or use the [upload icons script](./scripts/iconsUpload.ts).

## Feedback
If you find any bugs or have any feedback for the bot, you can report it either through a [Github issue](https://github.com/tarna/MinehutStuff/issues) or in the [Discord server](https://discord.gg/SScnNymExa).

You are also welcome to submit PRs to fix something or add new features.

## Notice
this bot and its owners is not affiliated with Minehut or GamerSafer in anyway. If you need support with Minehut, you can contact their support [here](https://support.minehut.com).