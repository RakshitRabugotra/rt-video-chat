import { User } from "@clerk/nextjs/server";

export interface SocketUser {
  userId: string;
  socketId: string;
  profile: User
}