import { PacketType } from '../constants.js';
let queue = [];
function handleMatchRequest(socket, data) {
  const { userId } = data;
  console.log(`매치 요청을 보낸 유저 ID: ${userId}`);
  queue.push({ socket, userId });
  console.log(`현재 대기열 상태: ${queue.map(user => user.userId).join(', ')}`);
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();
    console.log(`매칭 성공: ${player1.userId} vs ${player2.userId}`);
    const packet = {
      packetType: PacketType.S2C_MATCH_FOUND_NOTIFICATION,
      opponentId: player2.userId
    };
    player1.socket.emit('event', packet);
    player2.socket.emit('event', { ...packet, opponentId: player1.userId });
  }
}
export { handleMatchRequest };