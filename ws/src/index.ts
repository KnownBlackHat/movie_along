import { WebSocketServer } from "ws";
import { RoomManger } from "./managers/RoomManager";

const wss = new WebSocketServer({ port: 8000 });

wss.on('connection', function connection(ws, request) {

    const url = new URLSearchParams(request.url?.split('?')[1]);
    if (!url) {
        return;
    }
    const roomName = url.get('room') ?? '';
    const userName = url.get('user') ?? '';

    const room = RoomManger.getInstance().joinRoom(ws, roomName, userName)
    if (!room) {
        console.error("Room is full")
        ws.close()
        return;
    }

    // ws.on('message', function message(data) {
    //     console.log('url: ', request.url, 'rcv: ', data.toString())
    //     let msg: Message = JSON.parse(data.toString())
    //     if (msg.action === 'create') {
    //         console.log('Create')
    //         try {
    //             RoomManger.getInstance().createRoom(ws, msg.room, msg.user)
    //             ws.send(JSON.stringify({ action: 'create', success: true }))
    //         } catch (error) {
    //             ws.send(JSON.stringify({ action: 'create', success: false, error }))
    //         }
    //     }
    //     else if (msg.action === 'join') {
    //         try {
    //             RoomManger.getInstance().joinRoom(ws, msg.room, msg.user)
    //             ws.send(JSON.stringify({ action: 'join', success: true }))
    //         } catch (error) {
    //             ws.send(JSON.stringify({ action: 'join', success: false, error }))
    //         }
    //     }
    //     else if (msg.action === 'info')
    //         ws.send(RoomManger.getInstance().countRoom())
    // })
})

wss.on('listening', () => {
    console.log('Server is running on port 8000');
});
