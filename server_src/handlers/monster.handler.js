const { sendGameSync } = require('./gameSyncHandler');
const {
  createMonsters,
  getMonsters,
  setMonster,
  removeMonster,
} = require('../models/monster.model.js');
import { PacketType } from '../constants.js';

// 아군 몬스터 사망
function handleDieMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  const result = removeMonster(uuid, payload.monsterId);
  if (result.status === 'fail') {
    return result;
  }

  sendGameSync(uuid, {
    packetType: PacketType.C2S_DIE_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster is dead' };
}

// 적군 몬스터 사망
function handleEnemyDieMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  const result = removeMonster(uuid, payload.monsterId);
  if (result.status === 'fail') {
    return result;
  }

  sendGameSync(uuid, {
    packetType: PacketType.S2C_ENEMY_DIE_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster is dead' };
}

// 아군 몬스터 생성
function handleSpawnMonster(uuid, payload) {
  createMonsters(uuid);
  setMonster(uuid, payload.monsterId, payload.monsterLevel);

  sendGameSync(uuid, {
    packetType: PacketType.C2S_SPAWN_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster created' };
}

// 적군 몬스터 생성
function handleEnemySpawnMonster(uuid, payload) {
  createMonsters(uuid);
  setMonster(uuid, payload.monsterId, payload.monsterLevel);

  sendGameSync(uuid, {
    packetType: PacketType.S2C_ENEMY_SPAWN_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster created' };
}

export { handleDieMonster, handleEnemyDieMonster, handleSpawnMonster, handleEnemySpawnMonster };
