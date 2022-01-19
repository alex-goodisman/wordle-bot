import { Client, Intents } from 'discord.js';
import type { Interaction, TextChannel } from 'discord.js';
import { Wordle, Result } from './wordle';

const { token } = require('./config.json');

const MS_IN_DAY = 864e5;

class WordleBot
{
    client: Client;
    notifyChannels: Set<string> = new Set();
    currentGames: Map<string, Wordle> = new Map();
    constructor()
    {
        this.client = new Client(
        {
             intents:
             [
                 Intents.FLAGS.GUILDS,
             ],
        });

        this.client.on('ready', () =>
        {
            this.timer();
            console.log('ready');
        });

        this.client.on('interactionCreate', async (interaction: Interaction) =>
        {
            await this.handleInteraction(interaction);
        });

        this.client.login(token);
    }

    async handleInteraction(interaction: Interaction): Promise<void>
    {
        if(!interaction.isCommand())
        {
            return;
        }

        if(interaction.commandName === 'wordle')
        {
            switch(interaction.options.getSubcommand())
            {
                case 'about':
                    await interaction.reply('Wordle bot 1.1 - new puzzles every midnight EST');
                    break;
                case 'status':
                    if(!this.currentGames.has(interaction.user.id))
                    {
                        this.currentGames.set(interaction.user.id, new Wordle());
                    }
                    await interaction.reply({ephemeral: true, content: `\`\`\`\n${this.currentGames.get(interaction.user.id)!.print()}\n\`\`\``});
                    break;
                case 'guess':
                    if(!this.currentGames.has(interaction.user.id))
                    {
                        this.currentGames.set(interaction.user.id, new Wordle());
                    }
                    try
                    {
                        const word = interaction.options.getString('word');
                        await interaction.reply({ephemeral: true, content: this.currentGames.get(interaction.user.id)!.guess(word!)});
                    }
                    catch (err: any)
                    {
                        await interaction.reply({ephemeral: true, content: `Could not guess that word: ${(err as {message: string}).message}`});
                    }
                    break;
                case 'notify':
                    if(this.notifyChannels.has(interaction.channelId))
                    {
                        this.notifyChannels.delete(interaction.channelId);
                        await interaction.reply('Disabled notifications for this channel');
                    }
                    else
                    {
                        this.notifyChannels.add(interaction.channelId);
                        await interaction.reply('Enabled notifications for this channel');
                    }
                    break;
            }
        }
    }

    timer()
    {
        this.currentGames = new Map();
        this.notifyChannels.forEach(channelId =>
        {
            (this.client.channels.cache.get(channelId) as TextChannel).send('New Puzzle!');
        });
        const now = new Date();
        const msSinceMidnight = now.getTime() - now.setHours(0,0,0,0);
        setTimeout(() => this.timer(), MS_IN_DAY - msSinceMidnight)
    }
}


function main(): void
{
    new WordleBot();
}

main();
