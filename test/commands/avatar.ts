import { Command, CommandInfo } from '../../src';
import { Message } from 'discord.js';

module.exports = new class AvatarCommand extends Command {
    constructor() {
        super({
            name: 'avatar',
            aliases: ['av'],
            ignoreGuilds: false,
        });
    }
    private async getUser(msg: Message, id: string) {
        return id && await msg.client.users.fetch(id).catch(() => undefined) || msg.mentions.users.first() || msg.author;
    }
    public async fn(msg: Message, { args: [id] }: CommandInfo) {
        return msg.channel.send({ files: [ (await this.getUser(msg, id)).displayAvatarURL({ dynamic: true, size: 2048 }) ] });
    }
};