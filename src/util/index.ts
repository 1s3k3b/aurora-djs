import { ArgumentOptions } from './types';
import Constants from './Constants';

export const parseArgs = (text: string, options: ArgumentOptions): [string, string[], Record<string, true | string>] => {
    const flags: Record<string, true | string> = {};

    if (options.flags) {
        text = text.replace(Constants.FlagRegex(!!options.quotes), (_, name, value) => {
            flags[name] = typeof value === 'string' ? value.replace(/((^'|")|('|"$))/g, '') : true;
            return '';
        });
    }
    return [ text, text.split(Constants.ArgsRegex(!!options.multipleSpaces)).filter(x => x), flags ];
};
export const isToken = (str: string) => /[a-zA-Z0-9_]{5,50}\.[a-zA-Z0-9_]{5,50}\.[a-zA-Z0-9_]{5,50}/.test(str);
export const isID = (str: string) => /[0-9]{17,22}/.test(str);