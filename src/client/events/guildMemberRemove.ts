import { GuildMember, PartialGuildMember } from 'discord.js';

export default (member: GuildMember | PartialGuildMember) => {
    const { leaveMessage } = member.client.config;

    const content = leaveMessage!.content!
        .replace(/{{mention}}/g, member.user!.toString())
        .replace(/{{id}}/g, member.id)
        .replace(/{{tag}}/g, member.user!.tag)
        .replace(/{{username}}/g, member.user!.username)
        .replace(/{{servername}}/g, member.guild.name)
        .replace(/{{membercount}}/g, `${member.guild.memberCount}`);

    member.client.sendToChannel({ channel: leaveMessage!.channel, content }, member.guild);
};