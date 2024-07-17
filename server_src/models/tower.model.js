const towers = {}; //모든 유저의 타워 목록
//tower[userId] = {tower: {x좌표, y좌표}, level: 레벨, towerIndex: 타워번호}

export const createTowers = (uuid) => {
  towers[uuid] = [];
};

export const getTowers = (uuid) => {
  return towers[uuid];
};

export const setTower = (uuid, coordinateX, coordinateY, level, towerIndex) => {
  return towers[uuid].push({ tower: { X: coordinateX, Y: coordinateY }, level, towerIndex });
};

export const clearTowers = (uuid) => {
  return (towers[uuid] = []);
};

export const removeTower = (uuid, index) => {
  towers[uuid].splice(index, 1);
};
