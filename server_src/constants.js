export const CLIENT_VERSION = ['1.0.0', '1.0.1', '1.1.0'];

const PacketType = {
    S2C_GAMESYNC: 17,
    C2S_GAME_END_REQUEST: 3,
    S2C_GAME_OVER_NOTIFICATION: 4
    // 다른 패킷 타입을 추가
  };
  
  module.exports = { PacketType };