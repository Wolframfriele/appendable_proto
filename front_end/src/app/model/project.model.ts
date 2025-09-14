export type Project = {
  id: number;
  name: string;
  color: number | undefined;
  archived: boolean;
};

export type ArchiveProject = { id: Project["id"] };
