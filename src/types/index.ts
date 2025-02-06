import { User } from "@clerk/nextjs/server";
import Peer from "simple-peer";

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

export interface PeerData {
  peerConnection: Peer.Instance
  stream?: MediaStream
  participant: SocketUser
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
