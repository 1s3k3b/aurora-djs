import { Command, CommandInfo } from '../../src';
import { inspect } from 'util';
import { exec } from 'child_process';
import { Message, MessageAttachment } from 'discord.js';

const execPromise = (s: string) => new Promise((r, _, res = '') =>
    exec(s)
        .on('close', () => r(res))
        .stdout?.on('data', x => res += x),
);

module.exports = new class EvalCommand extends Command {
    constructor() {
        super({
            name: 'eval',
            aliases: ['eval'],
            ownerOnly: true,
        });
    }
    public async fn(msg: Message, { text, flags }: CommandInfo) {
        try {
            const evaled = await (flags.exec ? execPromise : eval)(text);
            const str = flags.noins ? `${evaled}` : inspect(evaled);
            if (!flags.noout) {
                if (str.length > 2000) msg.channel.send(new MessageAttachment(Buffer.from(str), 'eval.txt'));
                else msg.channel.send(str, { code: 'js' });
            }
        } catch (e) {
            msg.channel.send(e.message, { code: true });
        }
    }
};