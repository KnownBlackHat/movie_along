import { WebSocket } from "ws";
import { User } from "../user";
import { Room } from "../room";

let ID = 1;

export class UserManger {
    private _users: User[];
    private static _instance: UserManger;

    constructor() {
        this._users = [];
    }

    public static getInstance() {
        if (!this._instance)
            this._instance = new UserManger();
        return this._instance;
    }

    addUser(ws: WebSocket, name: string, room: Room): User {
        // TODO: use id so that it shouldn't be dependent on name
        let id = ID;
        let fuser = this.findUser(name)
        if (!fuser) {
            let user = new User(
                ws,
                name,
                id,
                room
            );
            this._users.push(user)
            ws.on('close', () => this.removeUser(id))
            ID++;
            return user;
        }
        return fuser;
    }

    removeUser(id: number) {
        this._users = this._users.filter(x => x.id !== id)
    }

    findUser(name: string): User | null {
        let user = this._users.filter(x => x.name === name)[0]
        return user
    }
}
