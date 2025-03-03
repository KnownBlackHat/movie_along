import { WebSocket } from "ws";
import { Room } from "./room";
import { Message } from "./types";

export class User {
    id: number;
    name: string;
    ws: WebSocket;
    room: Room;

    constructor(ws: WebSocket, name: string, id: number, room: Room) {
        this.id = id
        this.name = name;
        this.ws = ws;
        this.room = room;
        this.initHandlers();
    }

    initHandlers() {
        console.log(this.name, " Joined Room", this.room.name);

        this.ws.on('message', (data) => {
            let msg: Message = JSON.parse(data.toString())
            console.log('recv: ', msg.action);
            if (msg.action === "offer")
                this.room.onOffer(msg.sdp, this.name, msg.roomName);
            else if (msg.action === 'answer')
                this.room.onAnswer(msg.sdp, this.name, msg.roomName);
            else if (msg.action === 'msg')
                this.room.onMsg(msg.userName, msg.msg);
            else if (msg.action === 'add-ice-candidates')
                this.room.onIceCandidates(this.name, msg.candidate, msg.type)
            else if (msg.action === 'update-timestamp')
                this.room.onTimeStampUpdate(this.name, msg.timestamp)
        });

        // setInterval(() =>
        //     console.log('room: ', this.user1?.name, this.user2?.name)
        //     , 100)
        // const emitter = new EventEmitter()
        // emitter.on("')

    }


}
