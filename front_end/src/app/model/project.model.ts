export type Project = {
  id: number;
  name: string;
  archived: boolean;
  color: number;
};

export type ArchiveProject = { id: Project["id"] };
