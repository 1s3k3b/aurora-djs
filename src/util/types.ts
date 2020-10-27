import { Message, EmojiResolvable, MessageEmbed, GuildMember, ChannelResolvable, ClientOptions as DjsOptions, ActivityType, PermissionResolvable } from 'discord.js';
import Client from '../client/Client';
import CommandInfo from '../structures/CommandInfo';

export type ClientOptions =
    & AuroraClientOptions
    & DjsOptions
    & {
        client?: DjsOptions;
        clientOptions?: DjsOptions;
        options?: AuroraClientOptions;
        config?: AuroraClientOptions;
        token: string;
    };

export type AuroraClientEvents = 'inviteLink' | 'command' | 'commandFinish';

export interface AuroraClientOptions {
    ignoreBots?: boolean;
    ignoreDMs?: boolean;
    ignoreGuilds?: boolean;
    prefix?: string;
    prefixes: string | string[];
    owner?: string;
    owners?: string[];
    commands: string | string[] | CommandResolvable[];
    events?: Record<string, Function> | string;
    welcomeMessage?: MessageResolvable;
    leaveMessage?: MessageResolvable;
    unknownCommandMessage?: MessageResolvable;
    errorMessage?: MessageResolvable;
    noPermissionMessage?: MessageResolvable;
    readyMessage?: string;
    caseSensitive?: boolean;
    handleErrors?: boolean;
    activity?: string | ActivityResolvable;
    args?: ArgumentOptions;
    parseArgs?: (str: string, options: ArgumentOptions) => [string, string[], Record<string, true | string>];
}

export interface MessageResolvable {
    content?: string;
    channel?: ChannelResolvable;
}

export interface ActivityResolvable {
    text?: string;
    name?: string;
    type?: ActivityType;
    url?: string;
    fn?: (client: Client) => any;
}

export interface CommandResolvable {
    name: string;
    aliases?: string[];
    fn?: (msg: Message, obj: CommandInfo) => any;
    args?: ArgumentOptions;
    requiredPermissions?: PermissionResolvable;
    response?: MessageResolvable;
    ownerOnly?: boolean;
    ignoreBots?: boolean;
    ignoreDMs?: boolean;
    ignoreGuilds?: boolean;
    errorMessage?: MessageResolvable;
    noPermissionMessage?: MessageResolvable;
    handleErrors?: boolean;
}

export interface ArgumentOptions {
    flags?: boolean;
    quotes?: boolean;
    multipleSpaces?: boolean;
}

export interface MessageReplyOptions {
    then?: (msg: Message) => any;
    edit?: MessageEditOptions | string;
    react?: EmojiResolvable | EmojiResolvable[];
    delete?: {
        timeout?: number;
        reason?: string;
    };
}

export interface MessageEditOptions {
    content?: string;
    embed?: ((embed: MessageEmbed, msg: Message) => MessageEmbed) | MessageEmbed;
    fn?: (msg: Message) => any;
}

export interface OnlineMembersOptions {
    presences?: ('online' | 'idle' | 'dnd' | 'offline' | 'invisible')[];
    filter?: (m: GuildMember) => boolean;
    filterBots?: boolean;
    filterUsers?: boolean;
}