import { User } from "@clerk/nextjs/server";

export interface SocketUser {
  userId: string;
  socketId: string;
  profile: User;
}

export interface OngoingCall {
  participants: Participants;
  isRinging: boolean;
}

export interface Participants {
  caller: SocketUser;
  receiver: SocketUser;
}

/**
 * Other component types
 */

export type Point = {
  x: number;
  y: number;
};

export type TapInfo = {
  point: Point;
};

/**
 * Event handlers
 */
export type TapEventHandler = (
  event: MouseEvent | TouchEvent | PointerEvent,
  info: TapInfo
) => void;
