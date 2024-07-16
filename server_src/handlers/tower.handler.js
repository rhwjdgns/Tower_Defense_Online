import { PacketType } from '../constants.js';
import { getTowers, removeTower, setTower } from '../models/tower.model.js';

// 클라이언트 타워 vs 서버 타워 비교 함수
function compareTowers(currentTowers, gameTowers) {
  //길이가 다르면 차이가 있음

  if (currentTowers.length !== gameTowers.length) {
    return true;
  }

  // currentTower와 gameTower의 각 요소를 순회하며 비교
  for (let i = 0; i < currentTowers.length; i++) {
    const currentTower = currentTowers[i];
    const gameTowerPosition = gameTowers[i];

    //좌표를 비교
    if (
      currentTower.tower.X !== gameTowerPosition.x ||
      currentTower.tower.Y !== gameTowerPosition.y
    ) {
      return true; //차이가 있음
    }
  }

  return false; //차이가 없음
}

//서버에 타워를 추가한다
export const towerAddOnHandler = (userId, payload) => {
  // 유저의 현재 타워 정보
  const currentTowers = getTowers(userId);

  // 클라이언트의 타워 정보
  const gameTowers = payload.gameTowers;

  // 클라이언트 타워 vs 서버 타워 비교
  const hasDifference = compareTowers(currentTowers, gameTowers);
  if (hasDifference) {
    return {
      status: 'fail',
      message: 'There are differences between the client and server tower information',
    };
  }

  setTower(userId, payload.X, payload.Y, payload.level);
  return {
    status: 'success',
    message: `Tower Update: ${payload.X}, ${payload.Y}`,
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

export const towerAttackHandler = (userId, payload) => {
  const towers = getTowers(userId);
  const index = towers.findIndex(
    (element) => element.tower.X === payload.X && element.tower.Y === payload.Y,
  );

  if (index === -1) {
    return { status: 'fail', message: 'Tower not found' };
  }

  //몬스터 인덱스로 맞춘 몬스터 찾기
};
