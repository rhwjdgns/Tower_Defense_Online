import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';
import { towerAddOnHandler } from '../handlers/tower.handler.js';

const initSocket = (server) => {
  const io = new SocketIO(server);
  io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);
    
    socket.on('event', (packet) => {
      console.log(`Received packet: ${JSON.stringify(`패킷 타입 : ${packet.packetType} 유저 아이디 : ${packet.userId}`)}`);
      switch (packet.packetType) {
        case 13: // C2S_MATCH_REQUEST
          handleMatchRequest(socket, packet);
          break;
        case 5:
          towerAddOnHandler(socket, packet.userId, packet.payload);
          break;
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
