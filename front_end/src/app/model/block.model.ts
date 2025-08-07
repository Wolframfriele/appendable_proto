export type Block = {
  id: number;
  text: string;
  project: number | undefined;
  projectName: string | undefined;
  start: Date;
  end: Date | undefined;
  duration: number;
  tags: string[];
};

export type RemoveBlock = { id: Block["id"] };
