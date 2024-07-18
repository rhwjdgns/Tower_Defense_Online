import { getPlayData, getGameByUserId } from '../models/playData.model.js';
import { prisma } from '../utils/prisma/index.js';
import { PacketType } from '../constants.js';
import { sendGameSync } from './gameSyncHandler.js';
import { CLIENTS } from './matchMakingHandler.js';

// 게임 오버 패킷 생성 및 전송
function sendGameOver(game, winnerId, loserId) {
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

  console.log(`Sending game over packet to winner: ${winnerId} and loser: ${loserId}`);

  const winnerSocket = CLIENTS[winnerId];
  const loserSocket = CLIENTS[loserId];

  if (winnerSocket && loserSocket) {
    console.log(`Sending winner packet: ${JSON.stringify(winnerPacket)}`);
    console.log(`Sending loser packet: ${JSON.stringify(loserPacket)}`);

    winnerSocket.emit('event', winnerPacket);
    loserSocket.emit('event', loserPacket);

    saveScore(winnerId, getPlayData(winnerId).getScore());
    saveScore(loserId, getPlayData(loserId).getScore());
  } else {
    console.error(`Socket not found for winner: ${winnerId} or loser: ${loserId}`);
  }
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

// Base HP 업데이트 처리
function handleBaseHpUpdate(socket, data) {
  const { userId, baseHp } = data;
  const playerData = getPlayData(userId);
  if (playerData) {
    playerData.setBaseHp(baseHp);
    console.log(`Broadcasting base HP update: User ID: ${userId}, Base HP: ${baseHp}`);
    socket.broadcast.emit('event', {
      packetType: PacketType.S2C_UPDATE_BASE_HP,
      userId: userId,
      baseHp: baseHp,
    });

    if (playerData.getBaseHp() <= 0) {
      const game = getGameByUserId(userId);
      console.log(`Game found for user ${userId}: ${JSON.stringify(game)}`);  // Debugging line
      if (game) {
        const opponentUserId = game.player1.userId === userId ? game.player2.userId : game.player1.userId;
        const playerScore = playerData.getScore();
        const opponentScore = getPlayData(opponentUserId)?.getScore();

        if (opponentScore === undefined) {
          console.error(`Opponent score not found for User ID: ${opponentUserId}`);
          return;
        }

        if (playerScore > opponentScore) {
          sendGameOver(game, userId, opponentUserId);
        } else {
          sendGameOver(game, opponentUserId, userId);
        }
      } else {
        console.log(`No game found for User ID: ${userId}`);
      }
    }
  } else {
    console.log(`No play data found for User ID: ${userId}`);
  }
}

// 몬스터 공격 처리
function handleMonsterBaseAttack(socket, userId, payload) {
  const playerData = getPlayData(userId);
  const newBaseHp = playerData.getBaseHp() - payload.damage;
  playerData.setBaseHp(newBaseHp);
  sendGameSync(socket, userId, PacketType.S2C_UPDATE_BASE_HP, { playerBaseHp: playerData.getBaseHp() });

  if (newBaseHp <= 0) {
    const game = getGameByUserId(userId);
    console.log(`Game found for user ${userId}: ${JSON.stringify(game)}`);  // Debugging line
    if (game) {
      const opponentUserId = game.player1.userId === userId ? game.player2.userId : game.player1.userId;
      const playerScore = playerData.getScore();
      const opponentScore = getPlayData(opponentUserId)?.getScore();

      if (opponentScore === undefined) {
        console.error(`Opponent score not found for User ID: ${opponentUserId}`);
        return;
      }

      if (playerScore > opponentScore) {
        sendGameOver(game, userId, opponentUserId);
      } else {
        sendGameOver(game, opponentUserId, userId);
      }
    } else {
      console.log(`No game found for User ID: ${userId}`);
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

      handleGameEnd(CLIENTS[game.player1.userId], game.player1.userId, { score: player1Data.getScore() });
      handleGameEnd(CLIENTS[game.player2.userId], game.player2.userId, { score: player2Data.getScore() });
    }
  }
}

export { handleBaseHpUpdate, handleMonsterBaseAttack, handleGameEnd, sendGameOver, checkGameOver };
