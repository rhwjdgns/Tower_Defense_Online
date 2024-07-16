const monsters = {};

export const createMonsters = (userId) => {
  monsters[userId] = [];
};

export const getMonsters = (userId) => {
  return monsters[userId];
};

export const setMonster = (userId, monsterId, monsterLevel) => {
  return monsters[userId].push({ monsterId, monsterLevel });
};

export const clearMonsters = (userId) => {
  return (monsters[userId] = []);
};

export const removeMonster = (userId) => {
  monsters[userId].splice(index, 1);
};

export const monsterSpawnPoint = (userId) => {
  return (monsters[userId] = { x, y });
};
