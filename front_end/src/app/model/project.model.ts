export type Project = {
  id: number;
  name: string;
  archived: boolean;
  color: number | undefined;
};

export type ArchiveProject = { id: Project["id"] };
