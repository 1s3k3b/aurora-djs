import { MessageEmbed, Message } from 'discord.js';

export = (m: Message) => !m.author.bot && m.channel.send(
    new MessageEmbed()
        .setAuthor(m.author.tag, m.author.displayAvatarURL())
        .setTitle('Message Deleted!')
        .setDescription(m.content + '\u200b')
);