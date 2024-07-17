import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';
import { towerAddOnHandler, towerAttackHandler } from '../handlers/tower.handler.js';
import { activeSessions } from '../app.js';
import {
  handleDieMonster,
  handleSpawnMonster,
} from '../handlers/monster.handler.js';
//import { , , initialize, } from '../handlers/gameHandler.js';
import { PacketType } from '../constants.js';
import { handleMonsterBaseAttack } from '../handlers/gameHandler.js';

const initSocket = (server) => {
  const io = new SocketIO(server);

  //initialize(io); //io 객체 초기화

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
        // case 16: // S2C_UPDATE_BASE_HP
        //   handleBaseHpUpdate(socket, packet.payload);
        //   break;
        // 다른 이벤트 핸들러 추가
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
