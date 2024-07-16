const monsters = {};
let monsterIndex = 0;

export const createMonsters = (uuid) => {
  monsters[uuid] = [];
};

export const getMonsters = (uuid) => {
  return monsters[uuid];
};

export const setMonster = (uuid, hp) => {
  if (monsters[uuid] === undefined) {
    createMonsters(uuid);
  }
  monsterIndex++;
  console.log(monsterIndex);
  monsters[uuid].push({ monsterIndex, hp });
  return monsterIndex;
};

export const clearMonsters = (uuid) => {
  return (monsters[uuid] = []);
};

export const removeMonster = (uuid, monsterId) => {
  if (!monsters[uuid]) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  const index = monsters[uuid].findIndex((monster) => monster.id === monsterId);
  if (index === -1) {
    return { status: 'fail', message: 'Monster not found' };
  }

  monsters[uuid].splice(index, 1);
  return { status: 'success', message: 'Monster removed' };
};

export const monsterSpawnPoint = (uuid) => {
  return (monsters[uuid] = { x, y });
};
