import { Command } from "../command.service";

export const InsertModeMap = new Map<string, Command>([
  ['Escape', Command.SWITCH_TO_NORMAL_MODE],
]);
