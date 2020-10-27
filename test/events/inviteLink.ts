import { Message, Invite } from 'discord.js';

export = async (msg: Message, inv: Invite) => {
    if (msg.guild) await msg.delete().catch(() => {});
    msg.channel.send(`${msg.author.tag} sent an invite link to ${inv.guild?.name ?? 'an unknown guild'}.`);
};