import { SlashCommandBuilder } from 'discord.js';
import { TSlashCommand } from './slash-command.types';
import { slashAuthHandler } from './slash-command.handler';

export const DISCORD_COMMANDS: TSlashCommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName('auth')
      .setDescription(
        'Authenticate with your Jira username & access-token (or password)',
      ),
    execute: slashAuthHandler,
  },
];
