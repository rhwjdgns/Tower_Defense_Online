const { PacketType } = require('../constants');
const { handleLogin, handleRegister, handleGameEnd } = require('./authHandlers');
const {
  handleGameSync,
  handleGameOver,
  handleDieMonster,
  handleEnemyDieMonster,
  handleSpawnMonster,
  handleEnemySpawnMonster,
} = require('./gameHandler');

const handlerMapping = {
  [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
  [PacketType.C2S_REGISTER_REQUEST]: handleRegister,
  [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
  [PacketType.S2C_GAMESYNC]: handleGameSync,
  [PacketType.S2C_GAME_OVER_NOTIFICATION]: handleGameOver,
  [PacketType.C2S_SPAWN_MONSTER]: handleSpawnMonster,
  [PacketType.S2C_ENEMY_SPAWN_MONSTER]: handleEnemySpawnMonster,
  [PacketType.S2C_ENEMY_DIE_MONSTER]: handleEnemyDieMonster,
  [PacketType.C2S_DIE_MONSTER]: handleDieMonster,
};

module.exports = handlerMapping;
