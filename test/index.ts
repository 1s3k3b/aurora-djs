import { Client, parseArgs } from '../src';
import { config } from 'dotenv';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { Intents } from 'discord.js';

config();
new Client({
    client: { disableMentions: 'everyone', ws: { intents: Intents.ALL } },
    token: process.env.TOKEN!,
    readyMessage: 'Test bot online!',
    owner: '576083686055739394',

    ignoreDMs: false,
    ignoreGuilds: true,

    prefixes: ['!', '{{mention}}'],
    commands: './dist/test/commands/',
    events: './dist/test/events',
    errorMessage: { content: 'Error while executing {{command}}:```\n{{error}}```' },
    unknownCommandMessage: { content: 'That command doesn\'t exist' },
    activity: {
        text: '{{servercount}} servers, {{usercount}} users',
        type: 'WATCHING',
    },
    args: {
        multipleSpaces: true,
        quotes: true,
        flags: true,
    },
    parseArgs: (a, b) => {
        console.log('Parsing arguments...');
        return parseArgs(a, b);
    },
})
    // custom error tests
    .on('command', cmd => console.log(`Command \`${cmd.commandName}${cmd.text && ' ' + cmd.text}\` was ran by ${cmd.message.author.tag}`))
    .on('commandFinish', (cmd, res) => console.log(`Finished command \`${cmd.commandName}${cmd.text && ' ' + cmd.text}\` ran by ${cmd.message.author.tag} with result \`${res}\``))
    .on('error', e => console.error('Error:', e.message || e))
    // extension tests
    .on('message', async msg => {
        if (msg.author.bot || !msg.guild) return;
        msg.send('test', {
            then: (m: Message) => console.log(m.content),
            edit: {
                content: 'testing',
                embed: new MessageEmbed().setTitle('yes'),
            },
        });
        console.log('[extensions]', 'GuildMember#username', msg.member?.username);
        console.log('[extensions]', 'GuildMember#tag', msg.member?.tag);
        console.log('[extensions]', 'GuildMember#fetchLastMessage()', (<Message>await msg.member?.fetchLastMessage()).content);
        console.log('[extensions]', 'User#mutualGuilds', msg.author.mutualGuilds.map(x => x.name));
        console.log('[extensions]', 'User#fetchMutualGuilds()', (await msg.author.fetchMutualGuilds()).map(x => x.name));
        console.log('[extensions]', 'Guild#getOnlineMembers()', msg.guild?.getOnlineMembers().map(x => x.tag));
        console.log('[extensions]', 'Guild#fetchOnlineMembers(filterBots)', (await msg.guild?.fetchOnlineMembers({ filterBots: true }))!.map(x => x.tag));
    });