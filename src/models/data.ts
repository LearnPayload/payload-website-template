// data.ts
import type { PostAttributes, UserAttributes } from "./types";

export const posts: PostAttributes[] = [
  {
    id: "post-1",
    title: "Exploring TypeScript Generics",
    content: "Generics are powerful for reusable components.",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T11:30:00Z"),
  },
  {
    id: "post-2",
    title: "ActiveRecord Pattern in JS",
    content: "Simulating Eloquent in a strongly typed environment.",
    createdAt: new Date("2024-02-20T14:00:00Z"),
    updatedAt: new Date("2024-02-20T14:45:00Z"),
  },
  {
    id: "post-3",
    title: "Payload CMS Integration Tips",
    content: "Payload provides a great backend for TypeScript apps.",
    createdAt: new Date("2024-03-01T09:00:00Z"),
    updatedAt: new Date("2024-03-01T09:15:00Z"),
  },
];

export const users: UserAttributes[] = [
  {
    id: "user-1",
    username: "john_doe",
    email: "john.doe@example.com",
    registeredAt: new Date("2023-05-10T08:00:00Z"),
  },
  {
    id: "user-2",
    username: "jane_smith",
    email: "jane.smith@example.com",
    registeredAt: new Date("2023-07-22T12:00:00Z"),
  },
];
