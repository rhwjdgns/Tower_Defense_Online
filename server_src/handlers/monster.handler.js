import { getMonsters, setMonster } from '../models/monster.model.js';

// 몬스터 kill 시 작동하는 핸들러
export const monsterKillHandler = (uuid, payload) => {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'Monster is dead' };
};
