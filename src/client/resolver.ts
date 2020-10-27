import Command from '../structures/Command';
import Client from './Client';
import { ClientOptions as DjsOptions, Constants } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { ClientOptions, AuroraClientOptions, ArgumentOptions, CommandResolvable, ActivityResolvable, MessageResolvable } from '../util/types';

const isConstructor = (obj: any) => {
    try {
        Reflect.construct(Command, [], obj);
    } catch {
        return false;
    }
    return true;
};

const filterObj = <T>(obj: T, callback: (a: [string, any], ...args: any[]) => boolean): T => <T>Object.fromEntries(Object.entries(obj).filter(callback));

export const resolveOptions = (obj: ClientOptions): [DjsOptions, AuroraClientOptions, string] => {
    const clientOptsArr = <keyof typeof Constants.DefaultOptions><unknown>Object.keys(Constants.DefaultOptions);
    const configArr = ['ignoreBots', 'ignoreDMs', 'ignoreGuilds', 'prefixes', 'owner', 'owners', 'commands', 'events', 'welcomeMessage', 'leaveMessage', 'unknownCommandMessage', 'errorMessage', 'noPermissionMessage', 'readyMessage', 'token', 'caseSensitive', 'helpCommand', 'handleErrors', 'activity', 'args', 'parseArgs'];

    const clientOptsPath = obj.client || obj.clientOptions || obj;
    const clientOpts = filterObj(clientOptsPath, ([k]) => clientOptsArr.includes(k)) || {};

    const clientConfigPath = obj.options || obj.config || obj;
    const clientConfig = filterObj(clientConfigPath, ([k]) => configArr.includes(k)) || {};
    const token = obj.token;

    return [clientOpts, clientConfig, token];
};
export const resolvePermission = (s: string) =>
    `${s}`
        .trim()
        .toUpperCase()
        .replace(/[^A-Z _]+/g, '')
        .replace(/(\s|-)/g, '_');
export const resolveCommand = (obj: CommandResolvable, sendFn: Function, args: ArgumentOptions, clientOpts: AuroraClientOptions): CommandResolvable => {
    const name = (obj.name ?? (obj.aliases ? obj.aliases[0] : null) ?? '').trim();
    const response = obj.fn ? undefined : resolveMessage(obj.response || {}, false) ?? undefined;

    return Object.assign(obj, {
        name,
        aliases: obj.aliases ? [...Array.from(obj.aliases), name] : [name],
        response,
        fn: obj.fn || (msg => sendFn(response, msg.guild, msg)),
        errorMessage: resolveMessage(obj.errorMessage || clientOpts.errorMessage, false),
        noPermissionMessage: resolveMessage(obj.noPermissionMessage || clientOpts.noPermissionMessage, false),
        args: resolveArgs(obj.args || args),
        ownerOnly: !!obj.ownerOnly,
        ignoreBots: typeof ('ignoreBots' in obj ? obj : clientOpts).ignoreBots === 'boolean' ? ('ignoreBots' in obj ? obj : clientOpts).ignoreBots : true,
        ignoreDMs: typeof ('ignoreDMs' in obj ? obj : clientOpts).ignoreDMs === 'boolean' ? ('ignoreDMs' in obj ? obj : clientOpts).ignoreDMs : true,
        ignoreGuilds: !!('ignoreGuilds' in obj ? obj : clientOpts).ignoreGuilds,
        handleErrors: 'handleErrors' in obj || 'handleErrors' in clientOpts ? !!('handleErrors' in obj ? obj : clientOpts).handleErrors : true,
    });
};
export const resolveMessage = (obj: MessageResolvable | undefined, e: boolean): MessageResolvable | undefined =>
    obj && ({
        content: typeof obj === 'string' ? obj : obj.content,
        channel: obj.channel || (e ? 'random' : undefined),
    });
export const resolveActivity = (obj: string | ActivityResolvable): ActivityResolvable => ({
    fn: typeof (<ActivityResolvable>obj).fn === 'function'
        ? (<ActivityResolvable>obj).fn
        : (client: Client) => ({
            activity: {
                name: ((typeof obj === 'string' ? obj : (obj.text || obj.name)) || '')
                    .replace(/{{usercount}}/g, `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`)
                    .replace(/{{servercount}}/g, `${client.guilds.cache.size}`),
                type: (<ActivityResolvable>obj).type || 'PLAYING',
                url: (<ActivityResolvable>obj).url,
            },
        }),
});
export const resolveArgs = (obj: ArgumentOptions): ArgumentOptions => ({
    flags: typeof obj.flags === 'boolean' ? obj.flags : true,
    quotes: typeof obj.quotes === 'boolean' ? obj.quotes : true,
    multipleSpaces: typeof obj.multipleSpaces === 'boolean' ? obj.multipleSpaces : true,
});

export const resolveConfig = (obj: AuroraClientOptions, sendFn: Function): AuroraClientOptions => {
    const ownersPath = obj.owner || obj.owners;
    const prefixesPath = obj.prefix || obj.prefixes;

    if (typeof obj.commands === 'string') {
        const path = obj.commands;
        obj.commands = readdirSync(resolve(process.cwd(), path)).map(p => resolve(process.cwd(), path, p));
    }
    if (typeof obj.events === 'string') {
        const path = obj.events;
        obj.events = Object.fromEntries(readdirSync(resolve(process.cwd(), path)).map(p => [p.split('.')[0], require(resolve(process.cwd(), path, p))]));
    }

    return {
        ignoreBots: 'ignoreBots' in obj ? obj.ignoreBots : true,
        ignoreDMs: !!obj.ignoreDMs,
        ignoreGuilds: !!obj.ignoreGuilds,
        prefixes: Array.isArray(prefixesPath) ? prefixesPath : [`${prefixesPath}`],
        welcomeMessage: resolveMessage(obj.welcomeMessage, true) ?? undefined,
        leaveMessage: resolveMessage(obj.leaveMessage, true) ?? undefined,
        unknownCommandMessage: resolveMessage(obj.unknownCommandMessage, false) ?? undefined,
        errorMessage: resolveMessage(obj.errorMessage, false) ?? undefined,
        noPermissionMessage: resolveMessage(obj.noPermissionMessage, false) ?? undefined,
        readyMessage: obj.readyMessage && `${obj.readyMessage}`,
        commands: Array.isArray(obj.commands)
            ? (<(CommandResolvable | string)[]>obj.commands)
                .filter((x: any) => ['string', 'object'].includes(typeof x))
                .map(cmd => typeof cmd === 'string' ? <typeof Command | CommandResolvable>require(resolve(process.cwd(), cmd)) : cmd)
                .map((cmd): CommandResolvable =>
                    resolveCommand(
                        Command.isPrototypeOf(cmd) || isConstructor(cmd)
                            ? new (<new () => Command>cmd)()
                            : cmd,
                        sendFn,
                        resolveArgs((<CommandResolvable>cmd).args || obj.args || {}),
                        obj,
                    )
                )
            : [],
        events: obj.events,
        owners: Array.isArray(ownersPath)
            ? ownersPath.map(x => `${x}`.trim())
            : typeof ownersPath === 'string'
                ? [ownersPath]
                : [],
        caseSensitive: !!obj.caseSensitive,
        handleErrors: 'handleErrors' in obj ? !!obj.handleErrors : true,
        activity: obj.activity && resolveActivity(obj.activity),
        args: resolveArgs(obj.args || {}),
        parseArgs: typeof obj.parseArgs === 'function' ? obj.parseArgs : undefined,
    };
};