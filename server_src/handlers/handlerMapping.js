const { PacketType } = require('../constants');
const { handleLogin, handleGameEnd, handleGameSync, handleGameOver, handleMonsterAttack, handleBaseHpUpdate } = require('./handlers');

const handlerMapping = {
    [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
    [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
    [PacketType.C2S_GAMESYNC_REQUEST]: handleGameSync,
    [PacketType.S2C_GAME_OVER_NOTIFICATION]: handleGameOver,
    [PacketType.C2S_MONSTER_ATTACK_BASE]: handleMonsterAttack,
    [PacketType.S2C_UPDATE_BASE_HP]: handleBaseHpUpdate
};

module.exports = handlerMapping;
