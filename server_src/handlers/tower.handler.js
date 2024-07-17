import { PacketType } from '../constants.js';
import { getMonsters, setDamagedMonsterHp } from '../models/monster.model.js';
import { getPlayData } from '../models/playData.model.js';
import { getTowers, removeTower, setTower } from '../models/tower.model.js';
import { sendGameSync } from './gameSyncHandler.js';

//서버에 타워를 추가한다
export const towerAddOnHandler = (socket, userId, payload) => {
  const { x, y, level, towerIndex, towerCost } = payload;

  setTower(userId, x, y, level, towerIndex);
  const mainTowers = getTowers(userId);

  const playerData = getPlayData(userId);
  playerData.spendGold(towerCost);

  sendGameSync(socket, userId, PacketType.S2C_ENEMY_TOWER_SPAWN, { mainTowers });

  return {
    status: 'success',
    message: `Tower Update: ${payload.x}, ${payload.y}`,
  };
};

// 타워 업그레이드 핸들러
export const upgradeTowerHandler = (userId, payload) => {
  const towers = getTowers(userId);
  const index = towers.findIndex(
    (element) => element.tower.X === payload.X && element.tower.Y === payload.Y,
  );

  if (index === -1) {
    return { status: 'fail', message: 'Tower not found' };
  }

  towers[index].level = payload.level;

  return { status: 'success', message: 'Tower upgrade successfully' };
};

// 타워를 환불합니다.
export const towerRemoveHandler = (userId, payload) => {
  const towers = getTowers(userId);
  const index = towers.findIndex(
    (element) => element.tower.X === payload.X && element.tower.Y === payload.Y,
  );

  if (index === -1) {
    return { status: 'fail', message: 'Tower not found' };
  }

  //이부분 골드 환불 들어가야함

  removeTower(userId, index);

  return { status: 'success', message: 'Tower removed successfully' };
};

export const towerAttackHandler = (socket, userId, payload) => {
  const { damage, monsterIndex, towerIndex } = payload;

  const attackedMonsters = getMonsters(userId);
  const attackedTowers = getTowers(userId);

  const attackedMonster = attackedMonsters.find(
    (monster) => monster.monsterIndex === monsterIndex,
  );

  const attackedTower = attackedTowers.find((tower) => tower.towerIndex === towerIndex);
  setDamagedMonsterHp(userId, damage, monsterIndex);

  sendGameSync(socket, userId, PacketType.S2C_ENEMY_TOWER_ATTACK, {
    attackedMonster,
    attackedTower,
  });
};
