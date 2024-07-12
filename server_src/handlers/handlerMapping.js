const { PacketType } = require('../constants');
const {
  handleLogin,
  handleGameEnd,
  handleGameSync,
  handleGameOver,
  handleDieMonster,
  handleEnemyDieMonster,
  handleSpawnMonster,
  handleEnemySpawnMonster,
} = require('./handlers');

const handlerMapping = {
  [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
  [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
  [PacketType.C2S_GAMESYNC_REQUEST]: handleGameSync,
  [PacketType.S2C_GAME_OVER_NOTIFICATION]: handleGameOver,
  [PacketType.C2S_SPAWN_MONSTER]: handleSpawnMonster,
  [PacketType.S2C_ENEMY_SPAWN_MONSTER]: handleEnemySpawnMonster,
  [PacketType.S2C_ENEMY_DIE_MONSTER]: handleEnemyDieMonster,
  [PacketType.C2S_DIE_MONSTER]: handleDieMonster,
  // 추가 핸들러 매핑
};

module.exports = handlerMapping;
