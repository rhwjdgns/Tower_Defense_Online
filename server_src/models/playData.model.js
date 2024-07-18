const playData = {}; // 모든 게임 데이터 목록

export const createPlayData = (uuid, initData) => {
  playData[uuid] = initData;
};

export const getPlayData = (uuid) => {
  return playData[uuid];
};

export const setBaseHp = (uuid, data) => {
  return (playData[uuid].setBaseHp(data.damage));
};

export const setGold = (uuid, data) => {
  return (playData[uuid].setGold(data.gold));
};

export const clearPlayData = (uuid) => {
  delete playData[uuid];
};

export const getGameByUserId = (userId) => {
  // 모든 게임 객체를 순회하며 userId가 포함된 게임 객체를 찾음
  for (const [uuid, game] of Object.entries(playData)) {
    if (uuid === userId || game.opponentUserInfo === userId) {
      return {
        player1: { userId: uuid, data: game },
        player2: { userId: game.opponentUserInfo, data: getPlayData(game.opponentUserInfo) }
      };
    }
  }
  return null;
};

export class GameData {
  constructor(
    monsterPath,
    initialTowerCoords,
    basePosition,
    opponentMonsterPath,
    opponentInitialTowerCoords,
    opponentBasePosition,
    opponentUserInfo
  ) {
    this.score = 0;
    this.nextMilestone = 1000;
    this.userGold = 1000;
    this.baseHp = 100;
    this.monsterPath = monsterPath;
    this.initialTowerCoords = initialTowerCoords;
    this.basePosition = basePosition;
    this.opponentMonsterPath = opponentMonsterPath;
    this.opponentInitialTowerCoords = opponentInitialTowerCoords;
    this.opponentBasePosition = opponentBasePosition;
    this.opponentUserInfo = opponentUserInfo;
  }

  getOpponentInfo() {
    return this.opponentUserInfo;
  }

  getBaseHp() {
    return this.baseHp;
  }

  getScore() {
    return this.score;
  }

  getGold() {
    return this.userGold;
  }

  setBaseHp(value) {
    this.baseHp = value;
  }

  spendGold(value) {
    this.userGold -= value;
  }

  addScore(value) {
    this.score += value;

    if (this.score >= this.nextMilestone) {
      this.nextMilestone += 1000;
      this.userGold += 500;
    }
  }
}
