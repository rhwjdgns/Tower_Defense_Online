import { sendGameSync } from './gameSyncHandler.js';
import { PacketType } from '../constants.js';
import { getPlayData } from '../models/playData.model.js';
// 게임 오버 패킷 생성 및 전송
function sendGameOver(game, winner) {
  const loser = winner === game.player1 ? game.player2 : game.player1;

  const winnerPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: true,
    message: 'You won!',
  };

  const loserPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: false,
    message: 'You lost!',
  };

  winner.socket.emit('gameOver', winnerPacket);
  loser.socket.emit('gameOver', loserPacket);
}

// 게임 종료 요청 처리
function handleGameEnd(socket, packet) {
  const { userId, finalScore } = packet;
  // 유저의 최종 점수를 데이터베이스에 저장하는 로직 추가

  socket.emit('gameEnd', { success: true });
}

// Base HP 업데이트 처리
function handleBaseHpUpdate(socket, data) {
  const { userId, baseHp } = data;
  if (bases[userId]) {
    bases[userId].hp = baseHp;
    // 다른 클라이언트로 base HP 업데이트 브로드캐스트
    console.log(`Broadcasting base HP update: User ID: ${userId}, Base HP: ${baseHp}`);
    socket.broadcast.emit('event', {
      packetType: 'S2C_UPDATE_BASE_HP',
      userId: userId,
      baseHp: baseHp,
    });
  } else {
    console.log(`No base found for User ID: ${userId}`);
  }
}

// 몬스터 공격 처리
function handleMonsterBaseAttack(socket, userId, payload) {
  const playerData = getPlayData(userId);

  playerData.setBaseHp(playerData.getBaseHp() - payload.damage);
  sendGameSync(socket, userId, PacketType.S2C_UPDATE_BASE_HP, {playerBaseHp: playerData.getBaseHp()});
}

export { handleGameEnd, sendGameOver, handleMonsterBaseAttack, handleBaseHpUpdate };
