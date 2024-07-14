import { PacketType } from '../constants';
import { handleLogin, handleRegister } from './registerHandler';
import { handleGameEnd, someGameFunction } from './gameHandler';
import { sendGameSync } from './gameSyncHandler';

const handlerMapping = {
  [PacketType.C2S_LOGIN_REQUEST]: handleLogin,
  [PacketType.C2S_REGISTER_REQUEST]: handleRegister,
  [PacketType.C2S_GAME_END_REQUEST]: handleGameEnd,
  [PacketType.C2S_GAMESYNC_REQUEST]: sendGameSync,
  // 다른 핸들러 매핑 여기에 추가해주세용!
};

export default handlerMapping;
