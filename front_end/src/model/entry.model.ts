export type EntryModel = {
  id: number;
  parent: number | undefined;
  path: string;
  nesting: number;
  startTimestamp: Date;
  endTimestamp: Date | undefined;
  text: String;
  showTodo: boolean;
  isDone: boolean;
  estimatedDuration: number | undefined;
  tags: string[];
}
