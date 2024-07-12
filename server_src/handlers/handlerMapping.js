const { PacketType } = require('../constants');
const { handleLogin, handleGameEnd, handleGameSync, handleGameOver } = require('./handlers');

const handlerMapping = {
  [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
  [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
  [PacketType.C2S_GAMESYNC_REQUEST]: handleGameSync,
  [PacketType.S2C_GAME_OVER_NOTIFICATION]: handleGameOver,
  // 추가 핸들러 매핑
};

module.exports = handlerMapping;
