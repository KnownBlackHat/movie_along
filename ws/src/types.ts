import { WebSocket } from "ws";

export type User = {
    ws: WebSocket;
    name: string;
    id: number;
}

export type Room = {
    ws: WebSocket;
    name: string;
    id: number;
    user1?: User;
    user2?: User;
}

export type Message = {
    action: 'offer';
    sdp: string;
    roomName: string;
} | {
    action: 'answer';
    sdp: string;
    roomName: string;
} | {
    action: 'add-ice-candidates';
    candidate: RTCIceCandidate;
    type: 'sender' | 'receiver';
} | {
    action: 'msg';
    userName: string;
    msg: string;
}
