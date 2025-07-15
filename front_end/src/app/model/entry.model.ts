export type Entry = {
  id: number;
  parent: number | undefined;
  path: string;
  nesting: number;
  startTimestamp: Date;
  endTimestamp: Date | undefined;
  text: string;
  showTodo: boolean;
  isDone: boolean;
  estimatedDuration: number | undefined;
  tags: string[];
}
