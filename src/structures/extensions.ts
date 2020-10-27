import { Structures, MessageEmbed, TextChannel, DMChannel, Message, MessageOptions, Guild, Collection } from 'discord.js';
import { MessageReplyOptions, MessageEditOptions, OnlineMembersOptions } from '../util/types';
export class AuroraMessageEmbed extends MessageEmbed {
    public addBlankField(inline = false) {
        return this.addField('\u200B', '\u200B', inline);
    }
    public send(target: TextChannel | DMChannel | Message, options = {}, text: string) {
        return (target instanceof Message ? target.channel : target).send(text, { ...options, embed: this });
    }
}

Structures.extend('Message', Message =>
    class AuroraMessage extends Message {
        public send(content: string, options: MessageReplyOptions & MessageOptions) {
            const fn = (msg: Message) => {
                if (options.then) options.then(msg);
                if (options.edit) {
                    if (typeof (<MessageEditOptions>options.edit).fn === 'function') {
                    (<MessageEditOptions>options.edit).fn!(msg);
                    } else if (typeof options.edit === 'string') msg.edit(options.edit);
                    else msg.edit(
                        options.edit.content || '',
                        {
                            embed: typeof options.edit.embed === 'function'
                                ? (<Function>options.edit.embed)(msg.embeds[0], msg)
                                : options.edit.embed || {},
                        }
                    );
                }
                if (options.react) {
                    Array.isArray(options.react)
                        ? options.react.forEach(e => msg.react(e))
                        : msg.react(options.react);
                }
                if (options.delete) msg.delete(options.delete);
                return msg;
            };
            return this.channel
                .send(content, options)
                .then((m): Promise<Message | Message[]> => {
                    return m instanceof Array ? Promise.all(m.map(x => fn(x))) : <Promise<Message>><unknown>fn(m);
                });
        }
    }
);

Structures.extend('Guild', Guild =>
    class AuroraGuild extends Guild {
        public getOnlineMembers(
            {
                presences = ['online', 'idle', 'dnd'],
                filter,
                filterBots = false,
                filterUsers = false,
            }: OnlineMembersOptions = {}
        ) {
            return this.members.cache.filter(
                typeof filter === 'function'
                    ? filter
                    : m =>
                        (filterBots
                            ? !m.user.bot
                            : filterUsers
                                ? m.user.bot
                                : true)
                        && presences.includes(m.presence.status)
            );
        }
        public fetchOnlineMembers(
            {
                presences = ['online', 'idle', 'dnd'],
                filter,
                filterBots = false,
                filterUsers = false,
            }: OnlineMembersOptions = {}
        ) {
            return this.members
                .fetch()
                .then(a => a.filter(
                    typeof filter === 'function'
                        ? filter
                        : m =>
                            (filterBots
                                ? !m.user.bot
                                : filterUsers
                                    ? m.user.bot
                                    : true)
                            && presences.includes(m.presence.status)
                ));
        }
    }
);

export const AuroraGuildMember = Structures.extend('GuildMember', GuildMember =>
    class AuroraGuildMember extends GuildMember {
        public get username() {
            return this.user.username;
        }
        public get tag() {
            return this.user.tag;
        }
        public fetchLastMessage() {
            if (!this.lastMessageID || !this.lastMessageChannelID) return Promise.resolve();
            return (<TextChannel>this.client.channels.cache.get(this.lastMessageChannelID!)!).messages.fetch(this.lastMessageID);
        }
    }
);

export const AuroraUser = Structures.extend('User', User =>
    class AuroraUser extends User {
        public get mutualGuilds(): Collection<string, Guild> {
            return this.client.guilds.cache.filter(g => !!g.member(this));
        }
        public fetchMutualGuilds(): Promise<Guild[]> {
            return Promise
                .all(this.client.guilds.cache.map(g =>
                    g.members
                        .fetch(this)
                        .catch(() => null)
                ))
                .then(a =>
                    a
                        .filter(x => x)
                        .map(x => x!.guild)
                );
        }
    }
);