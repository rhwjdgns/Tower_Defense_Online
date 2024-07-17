import { PacketType } from '../constants.js';
import { getPlayData } from '../models/playData.model.js';
import { CLIENTS } from './matchMakingHandler.js';

// 상태 동기화 패킷 생성 및 전송
function sendGameSync(socket, userId, packetType, payload) {
  const { mainTowers, mainMonsters, attackedMonster, attackedTower, gold, score } = payload;

  const opponentPlayerId = getPlayData(userId).getOpponentInfo();
  const opponentClient = CLIENTS[opponentPlayerId];

  const playerPacket = {
    packetType: PacketType.S2C_GAMESYNC,
    data: {
      gold,
      score,
      attackedMonster,
    },
  };

  const opponentPacket = {
    packetType,
    data: {
      opponentTowers: mainTowers,
      opponentMonsters: mainMonsters,
      attackedOpponentMonster: attackedMonster,
      attackedOpponentTower: attackedTower,
    },
  };

  socket.emit('gameSync', playerPacket);
  opponentClient.emit('gameSync', opponentPacket);
}

export { sendGameSync };
