export const CLIENT_VERSION = ['1.0.0', '1.0.1', '1.1.0'];

export const PacketType = {

    C2S_LOGIN_REQUEST : 1,
    S2C_LOGIN_RESPONSE :2,
    C2S_REGISTER_REQUEST:18,
    S2C_REGISTER_RESPONSE:19,
    S2C_GAMESYNC: 17,
    C2S_GAME_END_REQUEST: 3,
    S2C_GAME_OVER_NOTIFICATION: 4,
    C2S_MATCH_REQUEST: 13,
    S2C_MATCH_FOUND_NOTIFICATION: 14,
    // 다른 패킷 타입을 추가
  };

  // module.exports = { PacketType };
