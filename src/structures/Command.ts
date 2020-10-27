import { PermissionResolvable } from 'discord.js';
import { Message } from 'discord.js';
import { ArgumentOptions, CommandResolvable, MessageResolvable } from '../util/types';
import CommandInfo from './CommandInfo';

export default abstract class Command implements CommandResolvable {
    public name!: string;
    public aliases?: string[];
    public args?: ArgumentOptions;
    public requiredPermissions?: PermissionResolvable;
    public response?: MessageResolvable;
    public ownerOnly?: boolean;
    constructor(obj: CommandResolvable) {
        Object.assign(this, obj);
    }
    public abstract fn(msg: Message, cmd: CommandInfo): any;
}