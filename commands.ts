import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const { clientId, token } = require('./config.json');

const target = process.argv[2];

if(!target)
{
    console.log('A target server must be specified to add the commands. To add them globally, specify the target as "GLOBAL"');
    process.exit(0);
}


const commands =
[
    new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Interact with Wordle bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('about')
                .setDescription('Get information about the Wordle bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Show the status of the current puzzle'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('notify')
                .setDescription('Toggle receiving new puzzle notifications in this server'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('guess')
                .setDescription('Guess a word towards the current puzzle')
                .addStringOption(option =>
                    option
                        .setName('word')
                        .setDescription('The word to guess')
                        .setRequired(true))),
];

const rest = new REST({ version: '9' }).setToken(token);

const route = (target == 'GLOBAL') ? Routes.applicationCommands(clientId) : Routes.applicationGuildCommands(clientId, target);

rest.put(route, { body: commands.map(command => command.toJSON()) })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
