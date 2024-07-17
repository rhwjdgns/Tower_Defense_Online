import { PacketType } from '../constants.js';
import { getTowers, removeTower, setTower } from '../models/tower.model.js';
import { sendGameSync } from './gameSyncHandler.js';

//서버에 타워를 추가한다
export const towerAddOnHandler = (socket, userId, payload) => {
  const { x, y, level } = payload;

  setTower(userId, x, y, level);
  const mainTowers = getTowers(userId);

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
  const { damage, monsterIndex } = payload;

  sendGameSync(socket, userId, PacketType.S2C_ENEMY_TOWER_ATTACK, {});

  //console.log(`타워 공격 성공!!! : ${payload.hp}`);
  //몬스터 인덱스로 맞춘 몬스터 찾기
};
