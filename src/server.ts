import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import { RoomManager } from './services/roomManager.js';
import nbaPlayers from './data/NbaPlayers.json' with { type: 'json' };
import type { NbaPlayer } from './types/room.js';


const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const roomManager = new RoomManager();



io.on('connection', (socket)=> {
	console.log(`Player connected: ${socket.id}`);


	socket.on('create_room', ({ username }, callback) => {
    const room = roomManager.createRoom(socket.id, username);
    socket.join(room.roomId);
    callback({ roomId: room.roomId });
    io.to(room.roomId).emit('room_state_updated', room);
    console.log(`Room created: ${room.roomId} by ${username}`);
  });


  socket.on('join_room', ({ roomId, username }, callback) => {
    const formattedRoomId = roomId.toUpperCase();
    const room = roomManager.joinRoom(formattedRoomId, socket.id, username);

    if (!room) {
      return callback({ success: false, error: 'Room not found or game already started.' });
    }

    socket.join(formattedRoomId);
    callback({ success: true });
    io.to(formattedRoomId).emit('room_state_updated', room);
    console.log(`${username} joined room: ${formattedRoomId}`);
  });

  socket.on('disconnect', () => {
    const result = roomManager.leaveRoom(socket.id);
    if (result) {
      const { room } = result;
      io.to(room.roomId).emit('room_state_updated', room);
      console.log(`Player left room: ${room.roomId}`);
    } else {
      console.log(`Player disconnected: ${socket.id}`);
    }
  });


  socket.on('start_game', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room || room.hostId !== socket.id) return;

    const updatedRoom = roomManager.startGame(room.roomId);
    if (updatedRoom) {
      io.to(room.roomId).emit('room_state_updated', updatedRoom);
      console.log(`Game started in room ${room.roomId}. Secret player: ${updatedRoom.secretPlayer?.name}`);
    }
  });
});

const PORT = 42069;

httpServer.listen(PORT, ()=>{
	console.log(`server running on ${PORT}`);
});
