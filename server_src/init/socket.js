import { Server as SocketIO } from 'socket.io';
import { handleMatchRequest } from '../handlers/matchMakingHandler.js';

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
        // 다른 이벤트 핸들러 추가
        default:
          console.log(`Unknown packet type: ${packet.packetType}`);
      }
    });
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // 대기열에서 사용자를 제거하는 로직 추가 필요
    });
  });
};
export default initSocket;