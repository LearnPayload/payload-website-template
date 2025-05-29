// types.ts
export interface PostAttributes {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  registeredAt: Date;
}

export interface Result<T> {
  total: number;
  docs: T[];
}

export type CollectionSlug = "posts" | "users";
