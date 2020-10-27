import { MessageOptions } from 'discord.js';
import { Collection } from 'discord.js';
import { Message } from 'discord.js';
import CommandInfo, { CommandInfo } from './structures/CommandInfo';
import { MessageResolvable as AuroraMessageResolvable, CommandResolvable, AuroraClientOptions, ArgumentOptions, MessageReplyOptions, OnlineMembersOptions, AuroraClientEvents } from './util/types';

declare module 'discord.js' {
    interface Client {
        public commands: Collection<string, CommandResolvable>;
        public events: Collection<ClientEvents | AuroraClientEvents, Function>;
        public config: AuroraClientOptions;
        public mentionPrefixRegex: RegExp;
        public parseArgs: (str: string, options: ArgumentOptions) => [string, string[], Record<string, true | string>];
        public sendToChannel(obj: AuroraMessageResolvable, guild: Guild, msg?: Message): Promise<Message> | undefined;
        public emit(e: 'inviteLink', msg: Message, inv: Invite): boolean;
        public emit(e: 'command', cmd: CommandInfo): boolean;
        public emit(e: 'commandFinish', msg: CommandInfo, res: any): boolean;
        public on(e: 'inviteLink', fn: (msg: Message, inv: Invite) => any): this;
        public on(e: 'command', fn: (cmd: CommandInfo) => any): this;
        public on(e: 'commandFinish', fn: (cmd: CommandInfo, res: any) => any): this;
    }
    interface Message {
        public send(content: string, options: MessageReplyOptions & MessageOptions): Promise<Message | Message[]>;
    }
    interface Guild {
        public getOnlineMembers(options?: OnlineMembersOptions): Collection<string, GuildMember>;
        public fetchOnlineMembers(options?: OnlineMembersOptions): Promise<Collection<string, GuildMember>>;
    }
    interface GuildMember {
        public username: string;
        public tag: string;
        public fetchLastMessage(): Promise<Message | void>;
    }
    interface User {
        public mutualGuilds: Collection<string, Guild>;
        public fetchMutualGuilds(): Promise<Guild[]>;
    }
}