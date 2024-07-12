const monsters = {};

export const createMonsters = (uuid) => {
  monsters[uuid] = [];
};

export const getMonsters = (uuid) => {
  return monsters[uuid];
};

export const setMonster = (uuid, id, level) => {
  return monsters[uuid].push({ id, level });
};

export const clearMonsters = (uuid) => {
  return (monsters[uuid] = []);
};
