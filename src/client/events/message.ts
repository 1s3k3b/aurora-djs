import { Message } from 'discord.js';
import CommandInfo from '../../structures/CommandInfo';
import Constants from '../../util/Constants';

export default async (msg: Message) => {
    const matchedInvite = msg.content.match(Constants.InviteRegex);
    if (matchedInvite)
        msg.client
            .fetchInvite(matchedInvite[1])
            .then(inv => msg.client.emit('inviteLink', msg, inv));

    const mentionPrefix = msg.content.match(msg.client.mentionPrefixRegex);
    const currentPrefix = mentionPrefix && msg.client.config.prefixes.includes('{{mention}}')
        ? mentionPrefix[0]
        : (<string[]>msg.client.config.prefixes).find(p =>
            (msg.client.config.caseSensitive ? msg.content : msg.content.toLowerCase())
                .startsWith(msg.client.config.caseSensitive ? p : p.toLowerCase())
        );
    if (!currentPrefix) return;

    let [, [cmdName = ''] ] = msg.client.parseArgs(
        msg.content.slice(currentPrefix.length),
        msg.client.config.args!
    );
    const cmd = msg.client.commands.find(c =>
        c.aliases!
            .map(a => msg.client.config.caseSensitive ? a : a.toLowerCase())
            .includes(msg.client.config.caseSensitive ? cmdName : cmdName.toLowerCase())
    );

    if (!cmd) {
        return (msg.client.config.ignoreBots && msg.author.bot)
            || (msg.client.config.ignoreDMs && msg.channel.type === 'dm')
            || (msg.client.config.ignoreGuilds && msg.guild)
            || msg.client.config.unknownCommandMessage
            && cmdName
            && msg.client.sendToChannel(
                msg.client.config.unknownCommandMessage,
                msg.guild!,
                msg,
            );
    }
    if (
        (cmd.ignoreBots && msg.author.bot)
            || (cmd.ignoreGuilds && msg.guild)
            || (cmd.ignoreDMs && msg.channel.type === 'dm')
    ) return;

    let [ text, args, flags ] = msg.client.parseArgs(msg.content.slice(currentPrefix.length), cmd.args!);
    cmdName = args.shift()!;
    if (!msg.client.config.caseSensitive) cmdName = cmdName.toLowerCase();
    text = text.slice(cmdName.length).trim();

    if (
        (cmd.ownerOnly && !msg.client.config.owners!.includes(msg.author.id))
            || (cmd.requiredPermissions && !msg.member!.hasPermission(cmd.requiredPermissions!))
    ) {
        return cmd.noPermissionMessage && msg.client.sendToChannel(
            cmd.noPermissionMessage,
            msg.guild!,
            msg,
        );
    }

    try {
        const commandInfo = new CommandInfo(msg, msg.client, cmdName, cmd, text, args, flags, currentPrefix);
        msg.client.emit('command', commandInfo);
        const res = await cmd!.fn!(msg, commandInfo);
        msg.client.emit('commandFinish', commandInfo, res);
    } catch (e) {
        if (cmd.handleErrors) msg.client.emit('error', e);
        if (cmd.errorMessage) return msg.client.sendToChannel({
            channel: cmd.errorMessage.channel,
            content: cmd.errorMessage.content
                ?.replace(/{{error}}/g, e.message || e)
                .replace(/{{command}}/g, cmdName),
        }, msg.guild!, msg);
        if (!cmd.handleErrors) throw e;
    }
};