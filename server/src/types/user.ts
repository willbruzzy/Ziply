export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
