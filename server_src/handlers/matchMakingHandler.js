import { PacketType } from '../constants.js';

let queue = [];

function handleMatchRequest(socket, data) {
  const { userId } = data;
  console.log(`매치 요청을 보낸 유저 ID: ${userId}`);
  
  // const alreadyInQueue = queue.some(user=>user.userId ===userId);

  // if(alreadyInQueue){
  //   console.log(`${userId}유저 아이디는 이미 대기열에 있습니다`);
  //   return;
  // }

  // socket.emit('event',{
  //   packetType:PacketType.S2C_MATCH_FOUND_NOTIFICATION,
  //   message: '이미 대기열에 있는 아이디 입니다'
  // });

  
  queue.push({ socket, userId });
  console.log(`현재 대기열 상태: ${queue.map(user => user.userId).join(', ')}`);
  
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();

    if(player1.userId ===player2.userId){
      console.log(`Player 1 : ${player1.userId} & Player 2 : ${player2.userId}`);
      queue.unshift(player2);
    }
  
    console.log(`매칭 성공: ${player1.userId} vs ${player2.userId}`);
    
    
    const packet = {
      packetType: PacketType.S2C_MATCH_FOUND_NOTIFICATION,
      opponentId: player2.userId
    };
    player1.socket.emit('event', packet);
    player2.socket.emit('event', {...packet, opponentId: player1.userId });

    return;
  }
}
export { handleMatchRequest };