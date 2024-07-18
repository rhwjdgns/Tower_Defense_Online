import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';
import { handleGameEnd, sendGameOver } from '../handlers/gameHandler.js';
import { towerAddOnHandler, towerAttackHandler } from '../handlers/tower.handler.js';
import { activeSessions } from '../app.js';
import {
  handleDieMonster,
  handleSpawnMonster,
} from '../handlers/monster.handler.js';
import { PacketType } from '../constants.js';
import { handleMonsterBaseAttack } from '../handlers/gameHandler.js';

const initSocket = (server) => {
  const io = new SocketIO(server);

  io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('event', (packet) => {
      console.log(`Received packet: ${JSON.stringify(`패킷 타입 : ${packet.packetType} 유저 아이디 : ${packet.userId}`)}`);

      socket.userId = packet.userId;

      switch (packet.packetType) {
        case PacketType.C2S_MATCH_REQUEST:
          handleMatchRequest(socket, packet);
          break;
        case PacketType.C2S_TOWER_BUY:
          towerAddOnHandler(socket, packet.userId, packet.payload);
          break;
        case PacketType.C2S_TOWER_ATTACK:
          towerAttackHandler(socket, packet.userId, packet.payload);
          break;
        case PacketType.C2S_SPAWN_MONSTER:
          handleSpawnMonster(socket, packet.userId, packet.payload);
          break;
        case PacketType.C2S_DIE_MONSTER:
          handleDieMonster(socket, packet.userId, packet.payload);
          break;
        case PacketType.C2S_MONSTER_ATTACK_BASE:
          handleMonsterBaseAttack(socket, packet.userId, packet.payload);
          break;
        case PacketType.C2S_GAME_END_REQUEST:
          handleGameEnd(socket, packet.userId, packet.payload); 
          break;
        default:
          console.log(`Unknown packet type: ${packet.packetType}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.userId && activeSessions[socket.userId]) {
        delete activeSessions[socket.userId];
        console.log(`Session for user ${socket.userId} has been invalidated.`);
      }
    });
  });
};

export default initSocket;
