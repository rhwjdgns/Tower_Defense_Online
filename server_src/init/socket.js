import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';
import {
  handleDieMonster,
  handleEnemyDieMonster,
  handleEnemySpawnMonster,
  handleSpawnMonster,
} from '../handlers/monster.handler.js';

const initSocket = (server) => {
  const io = new SocketIO(server);
  io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);
    socket.on('event', (packet) => {
      console.log(`Received packet: ${JSON.stringify(packet)}`);
      switch (packet.packetType) {
        case 13: // C2S_MATCH_REQUEST
          handleMatchRequest(socket, packet);
          break;
        case 9: // C2S_SPAWN_MONSTER
          handleSpawnMonster(packet.userId, packet.payload);
          break;
        case 11: // S2C_ENEMY_SPAWN_MONSTER
          handleEnemySpawnMonster(packet.userId, packet.payload);
          break;
        case 10: // C2S_DIE_MONSTER
          handleDieMonster(packet.userId, packet.payload);
          break;
        case 12: // S2C_ENEMY_DIE_MONSTER
          handleEnemyDieMonster(packet.userId, packet.payload);
        // 다른 이벤트 핸들러 추가
        default:
          console.log(`Unknown packet type: ${packet.packetType}`);
      }
    });
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
export default initSocket;
