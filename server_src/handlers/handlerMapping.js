import { DieMonster, EnemyDieMonster, EnemySpawnMonster, SpawnMonster } from './monster.handler.js';

const handlerMappings = {
  10: SpawnMonster,
  11: DieMonster,
  12: EnemySpawnMonster,
  13: EnemyDieMonster,
};

export default handlerMappings;
