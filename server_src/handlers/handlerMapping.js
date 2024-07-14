// const { PacketType } = require('../constants');
// const { handleLogin, handleGameEnd, handleGameSync, handleGameOver,handleRegister } = require('./handlers');

import { PacketType } from '../constants.js';
import {handleLogin,handleRegister } from '../handlers/userHandler.js';
import { handleMatchRequest } from './matchMakingHandler.js';
// import {handleGameEnd, handleGameOver} from '../handlers/gameHandler.js';
// import {handleGameSync} from '../handlers/gameSyncHandler.js';

const handlerMapping = {
  [PacketType.C2S_REGISTER_REQUEST]:handleRegister,
  [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
  // [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
  // [PacketType.C2S_GAMESYNC_REQUEST]: handleGameSync,
  // [PacketType.S2C_GAME_OVER_NOTIFICATION]: handleGameOver,
  [PacketType.C2S_MATCH_REQUEST]:handleMatchRequest,
  // 추가 핸들러 매핑
};

// module.exports = handlerMapping;
export default handlerMapping;
