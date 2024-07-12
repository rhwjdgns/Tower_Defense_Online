const { sendGameSync } = require('./gameSyncHandler');

// 게임 상태를 동기화하는 함수 호출
function someGameFunction(game) {
  // 게임 로직

  // 상태 동기화 호출
  sendGameSync(game);
}

module.exports = { someGameFunction };
