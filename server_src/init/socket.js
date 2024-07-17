import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';
import { towerAddOnHandler, towerAttackHandler } from '../handlers/tower.handler.js';
import { activeSessions } from '../app.js';
import {
  handleDieMonster,
  handleSpawnMonster,
} from '../handlers/monster.handler.js';
import { handleMonsterAttack, handleGameSync, initialize, handleBaseHpUpdate } from '../handlers/gameHandler.js';
import { PacketType } from '../constants.js';

const initSocket = (server) => {
  const io = new SocketIO(server);

  initialize(io); //io 객체 초기화

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
        case 10: // C2S_DIE_MONSTER
          handleDieMonster(packet.userId, packet.payload);
          break;
        case 12: // S2C_ENEMY_DIE_MONSTER
          handleEnemyDieMonster(packet.userId, packet.payload);
          break;
        case 14: // C2S_MONSTER_ATTACK_BASE
          handleMonsterAttack(packet.userId, packet.payload.damage);
          console.log(`Monster attacked base: Player ID: ${packet.userId}, Damage: ${packet.payload.damage}`);
          break;
        case 15: // C2S_GAME_SYNC
          handleGameSync(socket, packet.payload); // 게임 동기화 처리
          break;
        case 16: // S2C_UPDATE_BASE_HP
          handleBaseHpUpdate(socket, packet.payload);
          break;
        case 17: // C2S_GAME_SYNC
          handleGameSync(socket, packet.payload); // 게임 동기화 처리
          break;  
        // 다른 이벤트 핸들러 추가
        default:
          console.log(`Unknown packet type: ${packet.packetType}`);
      }
    });

    socket.on('gameSyncRequest', (packet) => {
      handleGameSyncRequest(socket, packet);
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
