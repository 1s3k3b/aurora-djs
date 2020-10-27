export default {
    InviteRegex: /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/,
    ArgsRegex: (multipleSpaces: boolean) => multipleSpaces ? /\s+/g : /\s/g,
    FlagRegex: (quotes: boolean) => new RegExp(`(?:^|\\s)--?(\\w+)(?:=${quotes ? '(\\w+|"[^"]+"|\'[^\']+\')' : '(\\w+)'})?`, 'g'),
};