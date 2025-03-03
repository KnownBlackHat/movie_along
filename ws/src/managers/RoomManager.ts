import { WebSocket } from "ws";
import { UserManger } from "./UserManager";
import { Room } from "../room";
import { User } from "../user";
import { Message } from "../types";

let ID = 1;

export class RoomManger {
    private _rooms: Room[];
    private static _instance: RoomManger;

    constructor() {
        this._rooms = [];
    }

    public static getInstance() {
        if (!this._instance)
            this._instance = new RoomManger();
        return this._instance;
    }

    createRoom(ws: WebSocket, name: string): Room {
        let id = ID;
        const room = new Room(
            ws,
            name,
            id
        )
        this._rooms.push(room)
        ws.on('close', () => this.deleteRoom(id))
        ID++;
        return room;
    }

    deleteRoom(id: number) {
        this._rooms = this._rooms.filter(x => x.id !== id)
    }

    joinRoom(ws: WebSocket, roomName: string, userName: string): Room | null {
        let room = this._rooms.filter(x => x.name === roomName)[0]
        if (!room) {
            room = this.createRoom(ws, roomName)
        }

        let user = UserManger.getInstance().addUser(ws, userName, room);

        if (!room?.user1) {
            room.user1 = user
        } else if (!room?.user2) {
            room.user2 = user
            let payload = {
                action: 'send-offer',
                roomName: room.name
            };
            room.user1.ws.send(JSON.stringify(payload));
            room.user2.ws.send(JSON.stringify(payload));
        } else {
            return null;
        }
        return room;
    }

    countRoom(): number {
        return this._rooms.length
    }

    getUsersName(roomName: string) {
        let room = this._rooms.filter(x => x.name === roomName)[0]
        return { user1: room.user1, user2: room.user2 };
    }
}
