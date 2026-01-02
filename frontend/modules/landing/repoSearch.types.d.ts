export type RepoSearchInput = {
  username: string;
};

export type RepoSearchSubmit = (input: RepoSearchInput) => void | Promise<void>;
