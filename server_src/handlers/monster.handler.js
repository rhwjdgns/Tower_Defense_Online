import { createMonsters, getMonsters, setMonster } from '../models/monster.model.js';

// 아군 몬스터 사망
export const DieMonster = (uuid, payload) => {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'Monster is dead' };
};

// 적군 몬스터 사망
export const EnemyDieMonster = (uuid, payload) => {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fall', message: 'Monsters not found' };
  }

  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'Monster is dead' };
};

// 아군 몬스터 생성
export const SpawnMonster = (uuid, payload) => {
  const monsters = createMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  createMonsters(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'create Monster' };
};

// 적군 몬스터 생성
export const EnemySpawnMonster = (uuid, payload) => {
  const monsters = createMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  createMonsters(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'create Monster' };
};
