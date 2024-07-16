import { getMonsters, setMonster, removeMonster } from '../models/monster.model.js';
import { sendGameSync } from './gameSyncHandler.js';

// 아군 몬스터 사망
function handleDieMonster(userId, payload) {
  const monsters = getMonsters(userId);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(userId, payload.monsterId, payload.monsterIndex);
  removeMonster(userId, payload.monsterId);
  console.log('아군 몬스터 사망', JSON.stringify(monsters));
  return { status: 'success', message: 'Monster is dead' };
}

// 적군 몬스터 사망
function handleEnemyDieMonster(userId, payload) {
  const monsters = getMonsters(userId);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(userId, payload.monsterId, payload.monsterIndex);
  removeMonster(userId, payload.monsterId);
  console.log('적군 몬스터 사망', JSON.stringify(monsters));
  return { status: 'success', message: 'Enemy Monster is dead' };
}

// 아군 몬스터 생성
function handleSpawnMonster(socket, userId, payload) {
  // const monsters = getMonsters(userId);
  // if (!monsters) {
  //   return { status: 'fail', message: 'Monsters not found' };
  // }
  const monsterIndex = setMonster(userId, payload.hp);
  // const opponentPlayerId = getPlayData(userId).getOpponentInfo();
  // const opponentClient = CLIENTS[opponentPlayerId];
  // const mainMonster = getMonsters(userId);
  // const opponentMonsters = getMonsters(opponentPlayerId);
  // sendGameSync(socket, opponentMonsters, opponentClient, mainMonster);
  sendGameSync(socket, userId, true);
  console.log('아군 몬스터 생성', JSON.stringify(`Create Monster: ${monsterIndex}`));
  return { status: 'success', message: 'Monster created' };
}

// 적군 몬스터 생성
function handleEnemySpawnMonster(userId, payload) {
  const monsters = getMonsters(userId);
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonster(userId, payload.monsterId, payload.monsterIndex);
  console.log('적군 몬스터 생성', JSON.stringify(monsters));
  return { status: 'success', message: 'Monster created' };
}

export { handleDieMonster, handleEnemyDieMonster, handleSpawnMonster, handleEnemySpawnMonster };
