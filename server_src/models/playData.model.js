const playData = {}; // 모든 게임 데이터 목록

export const createPlayData = (uuid, initData) => {
  playData[uuid] = new GameData(
    initData.monsterPath,
    initData.initialTowerCoords,
    initData.basePosition,
    initData.opponentMonsterPath,
    initData.opponentInitialTowerCoords,
    initData.opponentBasePosition,
    initData.opponentUserInfo
  );
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
  for (const [uuid, game] of Object.entries(playData)) {
    if (uuid === userId || game.opponentUserInfo === userId) {
      const opponentUserId = uuid === userId ? game.opponentUserInfo : uuid;
      const player1 = uuid === userId ? uuid : game.opponentUserInfo;
      const player2 = uuid === userId ? game.opponentUserInfo : uuid;

      console.log(`Found game for user: ${userId}, player1: ${player1}, player2: ${player2}`);

      return {
        player1: { userId: player1, data: game },
        player2: { userId: player2, data: getPlayData(opponentUserId) }
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
