const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
  new SlashCommandBuilder()
    .setName('showdown')
    .setDescription('Talk to showdown bot'),
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationCommands('965531868625776671'), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
