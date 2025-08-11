export type Project = {
  id: number;
  name: string;
  archived: boolean;
  color: string;
};

export type ArchiveProject = { id: Project["id"] };
