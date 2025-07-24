import { Command } from "../command.service";

export const NormalModeMap = new Map<string, Command>([
  ['i', Command.SWITCH_TO_INSERT_MODE],
  ['v', Command.SWITCH_TO_VISUAL_MODE],
  [':', Command.SWITCH_TO_COMMAND_MODE],
]);
