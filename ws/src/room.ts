import { WebSocket } from "ws";

import { User } from "./user";
import { Message } from "./types";

export class Room {
    ws: WebSocket;
    name: string;
    id: number;
    user1?: User;
    user2?: User;

    constructor(ws: WebSocket, name: string, id: number, user1?: User, user2?: User) {
        this.ws = ws;
        this.name = name;
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.initHandlers();
    }

    initHandlers() {
        console.log('Room ', this.name, ' created!')
    }

    onOffer(sdp: string, senderName: string, roomName: string) {
        const recvUser = this.user1?.name === senderName ? this.user2 : this.user1
        recvUser?.ws.send(JSON.stringify({
            action: 'offer',
            sdp,
            room: roomName
        }))
    }

    onAnswer(sdp: string, senderName: string, roomName: string) {
        const recvUser = this.user1?.name === senderName ? this.user2 : this.user1
        recvUser?.ws.send(JSON.stringify({
            action: 'answer',
            sdp,
            room: roomName
        }))
    }

    onIceCandidates(senderName: string, candidate: RTCIceCandidate, type: 'sender' | 'receiver') {
        const recvUser = this.user1?.name === senderName ? this.user2 : this.user1
        recvUser?.ws.send(JSON.stringify({
            action: 'add-ice-candidates',
            candidate,
            type
        }))
    }

    onMsg(senderName: string, msg: string) {
        const recvUser = this.user1?.name === senderName ? this.user2 : this.user1
        recvUser?.ws.send(JSON.stringify({
            action: 'msg',
            userName: senderName,
            msg
        }))
    }

    onTimeStampUpdate(senderName: string, timestamp: number) {
        const recvUser = this.user1?.name === senderName ? this.user2 : this.user1
        recvUser?.ws.send(JSON.stringify({
            action: 'update-timestamp',
            timestamp
        }))

    }


}
