import { Structures } from 'discord.js';

export { default as Client } from './client/Client';
export { default as Command } from './structures/Command';
export { default as CommandInfo } from './structures/CommandInfo';
export * from './util';
export * from './structures/extensions';
export const AuroraMessage = Structures.get('Message');
export const AuroraGuild = Structures.get('Guild');