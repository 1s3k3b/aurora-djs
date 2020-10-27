import { Command } from '../../src';

export = class ThrowCommand extends Command {
    constructor() {
        super({
            name: 'throw',
        });
    }
    public fn() {
        throw 'Oops!';
    }
}