import { getPlayData, getGameByUserId } from '../models/playData.model.js';
import { prisma } from '../utils/prisma/index.js';
import { PacketType } from '../constants.js';
import { sendGameSync } from './gameSyncHandler.js';
import { CLIENTS } from './matchMakingHandler.js'; 

function sendGameOver(game, winnerId, loserId) {
  const winnerPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: true,
    message: 'You won!',
    finalScore: getPlayData(winnerId).getScore(),
  };

  const loserPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: false,
    message: 'You lost!',
    finalScore: getPlayData(loserId).getScore(),
  };


  console.log(`Sending game over packet to winner: ${winnerId} and loser: ${loserId}`);

  const winnerSocket = CLIENTS[winnerId];
  const loserSocket = CLIENTS[loserId];

  if (winnerSocket && loserSocket) {
    console.log(`Sending winner packet: ${JSON.stringify(winnerPacket)}`);
    console.log(`Sending loser packet: ${JSON.stringify(loserPacket)}`);

    winnerSocket.emit('event', winnerPacket);
    loserSocket.emit('event', loserPacket);

    saveScore(winnerId, getPlayData(winnerId).getScore(), winnerSocket);  // Add socket parameter
    saveScore(loserId, getPlayData(loserId).getScore(), loserSocket);  // Add socket parameter
  } else {
    console.error(`Socket not found for winner: ${winnerId} or loser: ${loserId}`);
  }
}


function saveScore(userId, finalScore, socket) {
  console.log(`Saving score for user: ${userId}, score: ${finalScore}`);
  prisma.user.findUnique({ where: { userId }, include: { userInfo: true } })
    .then(user => {
      if (!user || !user.userInfo) {
        throw new Error(`User or userInfo not found for userId: ${userId}`);
      }
      const highScore = parseInt(user.userInfo.highScore || '0', 10);

      console.log(`Current high score: ${highScore}`);

      if (finalScore > highScore) {
        return prisma.userInfo.update({
          where: { userId },
          data: { highScore: finalScore },  // Int 타입으로 전달
        });
      }
    })
    .then(() => {
      console.log(`New high score set for user: ${userId}, score: ${finalScore}`);
      socket.emit('gameEnd', { success: true });
    })
    .catch((error) => {
      console.error('Error saving score:', error);
      socket.emit('gameEnd', { success: false, message: 'Internal server error' });
    });
}

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

function handleMonsterBaseAttack(socket, userId, payload) {
  const playerData = getPlayData(userId);
  const newBaseHp = playerData.getBaseHp() - payload.damage;
  playerData.setBaseHp(newBaseHp);
  sendGameSync(socket, userId, PacketType.S2C_UPDATE_BASE_HP, { playerBaseHp: playerData.getBaseHp() });

  if (newBaseHp <= 0) {
    const game = getGameByUserId(userId);
    if (game) {
      const opponentUserId = game.player1.userId === userId ? game.player2.userId : game.player1.userId;
      const playerScore = playerData.getScore();
      const opponentScore = getPlayData(opponentUserId)?.getScore();

      if (opponentScore === undefined) {
        console.error(`Opponent score not found for User ID: ${opponentUserId}`);
        return;
      }

      if (playerScore > opponentScore) {
        sendGameOver(socket, opponentClient, userId, opponentUserId);
      } else {
        sendGameOver(opponentClient, socket, opponentUserId, userId);
      }
    } else {
      console.log(`No game found for User ID: ${userId}`);
    }
  }
}

function handleGameEnd(socket, userId, packet) {
  const { score } = packet;
  console.log(`Saving score for user: ${userId}, score: ${score}`);
  prisma.user.findUnique({ where: { userId }, include: { userInfo: true } })
    .then(user => {
      if (!user || !user.userInfo) {
        throw new Error(`User or userInfo not found for userId: ${userId}`);
      }

      const highScore = parseInt(user.userInfo.highScore || '0', 10);
      console.log(`Current high score: ${highScore}`);

      console.log(`Current high score: ${highScore}`);
      if (score > highScore) {
        console.log('있음 수신');
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
    .catch((error) => {
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
