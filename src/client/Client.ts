import { ActivityResolvable, AuroraClientEvents, ClientOptions, CommandResolvable, MessageResolvable } from '../util/types';
import { Client as DjsClient, Guild, Message, TextChannel, Collection, ClientEvents } from 'discord.js';
import messageEvent from './events/message';
import guildMemberAddEvent from './events/guildMemberAdd';
import { resolveOptions, resolveConfig } from './resolver';
import { isID, parseArgs } from '../util';
import guildMemberRemoveEvent from './events/guildMemberRemove';

export default class Client extends DjsClient {
    constructor(options: ClientOptions) {
        const opts = resolveOptions(options);
        const [clientOptions, clientConfig, token] = opts;
        super(clientOptions);

        this.login(token);

        this.config = resolveConfig(clientConfig, this.sendToChannel.bind(this));
        this.commands = new Collection();
        this.events = new Collection();

        if (this.config.commands) (<CommandResolvable[]>this.config.commands).forEach(c => this.commands.set(c.name, c));
        if (this.config.events) this.events = new Collection(<[ClientEvents | AuroraClientEvents, (...args: any[]) => any][]>Object.entries(this.config.events));

        this.on('ready', () => {
            this.mentionPrefixRegex = new RegExp(`^<@!?${this.user!.id}>\\s*`);
            if (this.config.readyMessage) console.log(this.config.readyMessage);
            if (this.config.activity) this.user!.setPresence((<ActivityResolvable>this.config.activity).fn!(this));
        });
        this.on('message', messageEvent);
        if (this.config.welcomeMessage) this.on('guildMemberAdd', guildMemberAddEvent);
        if (this.config.leaveMessage) this.on('guildMemberRemove', guildMemberRemoveEvent);
        // @ts-ignore
        this.events.forEach((v, k) => this.on(k, this.config.handleErrors ? async (...args: any[]) => {
            try {
                await v(...args);
            } catch (e) {
                this.emit('error', e);
            }
        } : v));
    }
    get parseArgs() {
        return this.config.parseArgs || parseArgs;
    }
    public sendToChannel(obj: MessageResolvable, guild: Guild, msg?: Message) {
        const { channel } = obj;
        if (!channel) return msg?.channel.send(obj.content!);
        if (channel === 'random') {
            return (<TextChannel>guild.channels.cache
                .filter(c => c.hasOwnProperty('send'))
                .random()
            )?.send(obj.content!);
        }
        if (channel === 'first') {
            return (<TextChannel>guild.channels.cache.find(c => c.type === 'text'))?.send(obj.content!);
        }
        if (isID(`${channel}`)) {
            const channelF = <TextChannel>guild.channels.cache.get(`${channel}`);
            if (channelF) return channelF.send(obj.content!);
            return (<TextChannel>guild.channels.cache.first())?.send(obj.content!);
        }
        const channelF = <TextChannel>guild.channels.cache.find(c => c.name === channel);
        if (channelF) return channelF.send(obj.content!);
        return (<TextChannel>guild.channels.cache.find(c => c.type === 'text'))?.send(obj.content!);
    }
}
