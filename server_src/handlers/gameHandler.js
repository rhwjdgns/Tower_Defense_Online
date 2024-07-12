const { sendGameSync } = require('./gameSyncHandler');
const { PacketType } = require('../constants');

// 게임 오버 패킷 생성 및 전송
function sendGameOver(game, isWin) {
  const packet = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: isWin,
    message: isWin ? "You won!" : "You lost!",
  };

  game.player1.socket.emit('gameOver', packet);
  game.player2.socket.emit('gameOver', packet);
}

// 게임 종료 요청 처리
function handleGameEnd(socket, packet) {
  // 게임 종료 로직
  const { userId, finalScore } = packet;
  // TODO: 유저의 최종 점수를 데이터베이스에 저장하는 로직 추가

  socket.emit('gameEnd', { success: true });
}

function someGameFunction(game) {
  // 게임 로직...

  // 상태 동기화 호출
  sendGameSync(game);

  // 게임 오버 로직 예시
  if (game.player1.baseHp <= 0) {
    sendGameOver(game, false); // player1 패배
  } else if (game.player2.baseHp <= 0) {
    sendGameOver(game, true); // player1 승리
  }
}

module.exports = { someGameFunction, handleGameEnd };
