export type Entry = {
  id: number;
  parent: number;
  nesting: number;
  text: string;
  showTodo: boolean;
  isDone: boolean;
};

export type RemoveEntry = { id: Entry["id"] };
