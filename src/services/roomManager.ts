import type {Player, RoomState} from '../types/room.js';

export class RoomManager {
    private rooms: Record<string, RoomState> = {};

    private generateRoomId(): string{
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    public createRoom(hostSocketId: string,username: string): RoomState{
        const roomId = this.generateRoomId();
        const hostPlayer: Player = {
            id: hostSocketId,
            username,
            isHost: true,
            score: 0,
        };

        const room: RoomState = {
            roomId,
            hostId: hostSocketId,
            players: {[hostSocketId]: hostPlayer},
            status: 'LOBBY',
            currentRound: 0,
            totalRounds: 5,
        };

        this.rooms[roomId] = room;
        return room;
    }

    public joinRoom(roomId: string, socketId: string,username: string): RoomState | null{
        const room = this.rooms[roomId];
        if(!room || room.status !== 'LOBBY'){
            return null;
        }
        
        room.players[socketId] = {
            id: socketId,
            username, 
            isHost : false,
            score : 0,
        };
        return room;
    }

    public leaveRoom(socketId: string):{room: RoomState; wasHost: boolean} | null {
        for (const [roomId, room] of Object.entries(this.rooms)) {
        if (room.players[socketId]) {
            delete room.players[socketId];

            if (Object.keys(room.players).length === 0) {
            delete this.rooms[roomId];
            return null;
            }

            let wasHost = false;
            if (room.hostId === socketId) {
            wasHost = true;
            const newHostId = Object.keys(room.players)[0];
            if (newHostId){
                room.hostId = newHostId;
                room.players[newHostId]!.isHost = true;
                }
            }

            return { room, wasHost };
        }
        }
        return null;
    }

    public getRoom(roomId: string): RoomState | undefined {
        return this.rooms[roomId];
    }

    public getRoomBySocketId(socketId: string): RoomState | undefined {
    for (const room of Object.values(this.rooms)) {
      if (room.players[socketId]) {
        return room;
      }
    }
    return undefined;
  }

  public startGame(roomId: string): RoomState | null {
    const room = this.rooms[roomId];
    if (!room) return null;

    room.status = 'PLAYING';
    room.currentRound = 1;

    const randomIndex = Math.floor(Math.random() * 4);
    
    return room;
  }



}
