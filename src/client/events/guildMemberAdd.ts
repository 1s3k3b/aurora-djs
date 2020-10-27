import { GuildMember } from 'discord.js';

export default (member: GuildMember) => {
    const { welcomeMessage } = member.client.config;

    const content = welcomeMessage!.content!
        .replace(/{{mention}}/g, member.user!.toString())
        .replace(/{{id}}/g, member.id)
        .replace(/{{tag}}/g, member.user!.tag)
        .replace(/{{username}}/g, member.user!.username)
        .replace(/{{servername}}/g, member.guild.name)
        .replace(/{{membercount}}/g, `${member.guild.memberCount}`);

    member.client.sendToChannel({ channel: welcomeMessage!.channel, content }, member.guild);
};