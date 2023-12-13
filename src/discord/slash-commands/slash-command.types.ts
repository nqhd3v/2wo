import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export type TSlashCommand = {
  data: SlashCommandBuilder;
  execute: (interactive: ChatInputCommandInteraction) => Promise<void> | void;
};
