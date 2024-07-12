const { sendGameSync } = require('./gameSyncHandler');
const { PacketType } = require('../constants');
const { createMonsters, getMonsters, setMonster } = require('../models/monster.model.js');

// 아군 몬스터 사망
function handleDieMonster(uuid, payload) {
  const monsters = getMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(uuid, payload.monsterId, payload.monsterLevel);
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

  setMonster(uuid, payload.monsterId, payload.monsterLevel);
  sendGameSync(uuid, {
    packetType: PacketType.S2C_ENEMY_DIE_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster is dead' };
}

// 아군 몬스터 생성
function handleSpawnMonster(uuid, payload) {
  const monsters = createMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  createMonsters(uuid, payload.monsterId, payload.monsterLevel);
  sendGameSync(uuid, {
    packetType: PacketType.C2S_SPAWN_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster created' };
}

// 적군 몬스터 생성
function handleEnemySpawnMonster(uuid, payload) {
  const monsters = createMonsters(uuid);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  createMonsters(uuid, payload.monsterId, payload.monsterLevel);
  sendGameSync(uuid, {
    packetType: PacketType.S2C_ENEMY_SPAWN_MONSTER,
    monsterId: payload.monsterId,
    monsterLevel: payload.monsterLevel,
  });

  return { status: 'success', message: 'Monster created' };
}

module.exports = {
  handleDieMonster,
  handleEnemyDieMonster,
  handleSpawnMonster,
  handleEnemySpawnMonster,
};
