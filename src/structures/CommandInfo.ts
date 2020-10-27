import { Message } from 'discord.js';
import Client from '../client/Client';
import { CommandResolvable } from '../util/types';

export default class CommandInfo {
    constructor(
        public readonly message: Message,
        public readonly client: Client,
        public readonly commandName: string,
        public readonly command: CommandResolvable,
        public text: string,
        public args: string[],
        public flags: Record<string, true | string>,
        public prefix: string,
    ) {}
}
