import {
  createMonsters,
  getMonsters,
  setMonster,
  removeMonster,
} from ('../models/monster.model.js');
import { PacketType } from '../constants.js';

// 아군 몬스터 사망
function handleDieMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }
  setMonster(uuid, payload.monsterId, payload.monsterLevel)
  removeMonster(uuid, payload.monsterId, payload.monsterLevel)
  return { status: 'success', message: 'Monster is dead' };
}

// 적군 몬스터 사망
function handleEnemyDieMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }
  setMonster(uuid, payload.monsterId, payload.monsterLevel)
  removeMonster(uuid, payload.monsterId, payload.monsterLevel)
  return { status: 'success', message: 'Enemy Monster is dead' };
}

// 아군 몬스터 생성
function handleSpawnMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }
  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'Monster created' };
}

// 적군 몬스터 생성
function handleEnemySpawnMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }
  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  return { status: 'success', message: 'Monster created' };
}

export { handleDieMonster, handleEnemyDieMonster, handleSpawnMonster, handleEnemySpawnMonster };
