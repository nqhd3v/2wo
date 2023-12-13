import { TSlashCommand } from './slash-command.types';

export const slashAuthHandler: TSlashCommand['execute'] = async (
  interactive,
) => {
  await interactive.deferReply();
};
