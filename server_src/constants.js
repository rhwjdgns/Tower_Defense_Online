export const CLIENT_VERSION = ['1.0.0', '1.0.1', '1.1.0'];
export const RESOLUTION_WIDTH = 1200;
export const RESOLUTION_HEIGHT = 340;
export const INITIAL_TOWER_NUMBER = 3;

export const PacketType = {
  C2S_LOGIN_REQUEST: 1,
  S2C_LOGIN_RESPONSE: 2,
  C2S_GAME_END_REQUEST: 3,
  S2C_GAME_OVER_NOTIFICATION: 4,
  C2S_TOWER_BUY: 5,
  C2S_TOWER_ATTACK: 6,
  S2C_ENEMY_TOWER_SPAWN: 7,
  S2C_ENEMY_TOWER_ATTACK: 8,
  C2S_SPAWN_MONSTER: 9,
  C2S_DIE_MONSTER: 10,
  S2C_ENEMY_SPAWN_MONSTER: 11,
  S2C_ENEMY_DIE_MONSTER: 12,
  C2S_MATCH_REQUEST: 13,
  S2C_MATCH_FOUND_NOTIFICATION: 14,
  C2S_MONSTER_ATTACK_BASE: 15,
  S2C_UPDATE_BASE_HP: 16,
  S2C_GAMESYNC: 17,
  C2S_REGISTER_REQUEST: 18,
};

// module.exports = { PacketType };
