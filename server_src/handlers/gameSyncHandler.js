import { PacketType } from '../constants.js';
import { getMonsters } from '../models/monster.model.js';
import { getPlayData } from '../models/playData.model.js';
import { getTowers } from '../models/tower.model.js';
import { CLIENTS } from './matchMakingHandler.js';

// 상태 동기화 패킷 생성 및 전송
function sendGameSync(socket, userId, spawnStart) {
  const opponentPlayerId = getPlayData(userId).getOpponentInfo();
  const opponentClient = CLIENTS[opponentPlayerId];

  const mainTowers = getTowers(userId);
  const opponentTowers = getTowers(opponentPlayerId);
  const mainMonster = getMonsters(userId);
  const opponentMonsters = getMonsters(opponentPlayerId);

  const playerPacket = {
    packetType: PacketType.S2C_GAMESYNC,
    data: {
      opponentTowers,
      opponentMonsters,
    },
  };

  const opponentPacket = {
    packetType: PacketType.S2C_GAMESYNC,
    data: {
      opponentTowers: mainTowers,
      opponentMonsters: mainMonster,
      spawnStart,
    },
  };

  socket.emit('gameSync', playerPacket);
  opponentClient.emit('gameSync', opponentPacket);
}

export { sendGameSync };
