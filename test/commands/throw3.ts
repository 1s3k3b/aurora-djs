import { Command } from '../../src';

export = class ThrowCommand extends Command {
    constructor() {
        super({
            name: 'throw2',
            errorMessage: {
                content: 'F',
            },
        });
    }
    public fn() {
        throw 'Oops!';
    }
}