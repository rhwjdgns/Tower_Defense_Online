import { getPlayData, getGameByUserId } from '../models/playData.model.js';
import { prisma } from '../utils/prisma/index.js';
import { PacketType } from '../constants.js';
import { sendGameSync } from './gameSyncHandler.js';
import { CLIENTS } from './matchMakingHandler.js';

// 게임 오버 패킷 생성 및 전송
function sendGameOver(winnerSocket, loserSocket, winnerId, loserId) {
  const winnerPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: true,
    message: 'You won!',
    finalScore: getPlayData(winnerId).getScore()
  };

  const loserPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: false,
    message: 'You lost!',
    finalScore: getPlayData(loserId).getScore()
  };

  winnerSocket.emit('event', winnerPacket);
  loserSocket.emit('event', loserPacket);

  // 점수 저장 로직 추가
  console.log(`winner Score : ${getPlayData(winnerId).getScore()}
               loser Score : ${getPlayData(loserId).getScore()}`);
  saveScore(winnerId, getPlayData(winnerId).getScore());
  saveScore(loserId, getPlayData(loserId).getScore());
}

function saveScore(userId, finalScore) {
  console.log(`Saving score for user: ${userId}, score: ${finalScore}`);
  prisma.user.findUnique({ where: { userId }, include: { userInfo: true } })
    .then(user => {
      const highScore = user.userInfo.highScore || '0';
      console.log(`Current high score: ${highScore}`);

      if (finalScore > parseInt(highScore, 10)) {
        return prisma.userInfo.update({
          where: { userId },
          data: { highScore: finalScore.toString() },
        });
      }
    })
    .then(() => {
      console.log(`New high score set for user: ${userId}, score: ${finalScore}`);
    })
    .catch(error => {
      console.error('Error saving score:', error);
    });
}

// 몬스터 공격 처리
function handleMonsterBaseAttack(socket, userId, payload) {
  const playerData = getPlayData(userId);

  playerData.setBaseHp(playerData.getBaseHp() - payload.damage);
  sendGameSync(socket, userId, PacketType.S2C_UPDATE_BASE_HP, { playerBaseHp: playerData.getBaseHp() });

  const opponentUserId = playerData.opponentUserInfo;
  const opponentClient = CLIENTS[opponentUserId];
  

  // baseHp가 0이 되면 게임 오버 패킷 전송
  if (playerData.getBaseHp() <= 0) {
    const game = userId;
    if (game) {
      const playerScore = playerData.getScore();
      const opponentScore = getPlayData(opponentUserId).getScore();

      if (playerScore > opponentScore) {
        sendGameOver(socket, opponentClient, userId, opponentUserId);
      } else {
        sendGameOver(opponentClient, socket, opponentUserId, userId);
      }
    }
  }
}

// 게임 종료 요청 처리
function handleGameEnd(socket, userId, packet) {
  const { score } = packet;
  console.log(`Saving score for user: ${userId}, score: ${score}`);

  prisma.user.findUnique({ where: { userId }, include: { userInfo: true } })
    .then(user => {
      const highScore = parseInt(user.userInfo.highScore || '0', 10);
      console.log(`Current high score: ${highScore}`);

      if (score > highScore) {
        return prisma.userInfo.update({
          where: { userId },
          data: { highScore: score.toString() },
        });
      }
    })
    .then(() => {
      console.log(`New high score set for user: ${userId}, score: ${score}`);
      socket.emit('gameEnd', { success: true });
    })
    .catch(error => {
      console.error('Error saving score:', error);
      socket.emit('gameEnd', { success: false, message: 'Internal server error' });
    });
}

function checkGameOver(userId) {
  const game = getGameByUserId(userId);
  if (game) {
    const player1Data = getPlayData(game.player1.userId);
    const player2Data = getPlayData(game.player2.userId);

    if (player1Data.getBaseHp() <= 0 || player2Data.getBaseHp() <= 0) {
      if (player1Data.getScore() > player2Data.getScore()) {
        sendGameOver(game, game.player1.userId, game.player2.userId);
      } else {
        sendGameOver(game, game.player2.userId, game.player1.userId);
      }

      handleGameEnd(game.player1.socket, game.player1.userId, { score: player1Data.getScore() });
      handleGameEnd(game.player2.socket, game.player2.userId, { score: player2Data.getScore() });
    }
  }
}

export { handleMonsterBaseAttack, handleGameEnd, sendGameOver, checkGameOver };
