import { Command } from "../command.service";

export const VisualModeMap = new Map<string, Command>([
  ['Escape', Command.SWITCH_TO_NORMAL_MODE],
]);
