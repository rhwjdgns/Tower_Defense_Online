import { PacketType } from '../constants.js';
import { getPlayData } from '../models/playData.model.js';
import { CLIENTS } from './matchMakingHandler.js';

// 상태 동기화 패킷 생성 및 전송
function sendGameSync(socket, userId, packetType, payload) {
  const {
    mainTowers,
    mainMonsters,
    attackedMonster,
    attackedTower,
    destroyedMonsterIndex,
    gold,
    score,
  } = payload;

  const playerData = getPlayData(userId);
  const opponentPlayerId = playerData.getOpponentInfo();
  const opponentClient = CLIENTS[opponentPlayerId];

  const playerPacket = {
    packetType: PacketType.S2C_GAMESYNC,
    data: {
      gold: playerData.userGold,
      score: playerData.score,
      attackedMonster,
    },
  };

  const opponentPacket = {
    packetType,
    data: {
      opponentTowers: mainTowers,
      opponentMonsters: mainMonsters,
      opponentBaseHp: playerData.baseHp,
      attackedOpponentMonster: attackedMonster,
      attackedOpponentTower: attackedTower,
      destroyedOpponentMonsterIndex: destroyedMonsterIndex,
    },
  };

  socket.emit('gameSync', playerPacket);
  opponentClient.emit('gameSync', opponentPacket);
}

export { sendGameSync };
