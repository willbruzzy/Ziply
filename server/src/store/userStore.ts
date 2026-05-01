import { User } from "../types/user";

const users: Map<string, User> = new Map();

export function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function createUser(user: User): User {
  users.set(user.id, user);
  return user;
}
