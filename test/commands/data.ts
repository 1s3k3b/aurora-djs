import { inspect } from 'util';
import { Command, CommandInfo } from '../../src';
import { Message } from 'discord.js';

module.exports = new class AvatarCommand extends Command {
    constructor() {
        super({
            name: 'data',
            aliases: ['d'],
        });
    }
    public fn(msg: Message, { args, flags, text, commandName, prefix }: CommandInfo) {
        return msg.channel.send(`${prefix}${commandName} ${text}\nArgs: ${args.map(x => `\`${x.replace(/\\/g, '\\\\')}\``).join(', ')}\nFlags: ${inspect(flags)}`);
    }
};