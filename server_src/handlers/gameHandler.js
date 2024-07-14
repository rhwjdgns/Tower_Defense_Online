const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendGameSync } = require('./gameSyncHandler');
const { PacketType } = require('../constants');


// BaseID 확인 함수
async function getBaseById(baseId) {
  return await prisma.base.findUnique({
    where: { id: baseId },
  });
}

// 몬스터 공격 요청 처리
async function handleMonsterAttack(userId, payload) {
  const { targetBaseId, damage } = payload;
  const targetBase = await getBaseById(targetBaseId);
  if (!targetBase) {
    return { status: 'fail', message: 'Base not found' };
  }
  targetBase.hp -= damage;

  // 데이터베이스에서 기지 HP 업데이트
  await prisma.base.update({
    where: { id: targetBaseId },
    data: { hp: targetBase.hp },
  });

  const hpUpdatePacket = {
    packetType: PacketType.S2C_UPDATE_BASE_HP,
    hp: targetBase.hp,
  };

  // 데이터베이스에서 게임 조회
  const game = await prisma.game.findFirst({
    where: {
      OR: [
        { player1: { baseId: targetBaseId } },
        { player2: { baseId: targetBaseId } },
      ],
    },
    include: { player1: true, player2: true },
  });

  if (game.player1.base.id === targetBaseId) {
    game.player1.socket.emit('baseHpUpdate', hpUpdatePacket);
  } else {
    game.player2.socket.emit('baseHpUpdate', hpUpdatePacket);
  }

  // 상태 동기화 호출
  sendGameSync(game);

  return { status: 'success', message: 'Monster attack handled' };
}

// 기지 HP 업데이트 통지 처리
async function handleBaseHpUpdate(userId, payload) {
  const { baseId, newHp } = payload;
  const base = await getBaseById(baseId);
  if (!base) {
    return { status: 'fail', message: 'Base not found' };
  }
  base.hp = newHp;

  // 데이터베이스에서 기지 HP 업데이트
  await prisma.base.update({
    where: { id: baseId },
    data: { hp: base.hp },
  });

  const game = await prisma.game.findFirst({
    where: {
      OR: [
        { player1: { baseId: baseId } },
        { player2: { baseId: baseId } },
      ],
    },
    include: { player1: true, player2: true },
  });

  // 상태 동기화 호출
  sendGameSync(game);

  return { status: 'success', message: 'Base HP updated' };
}
// 게임 오버 패킷 생성 및 전송
function sendGameOver(game, isWin) {
  const packet = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: isWin,
    message: isWin ? "You won!" : "You lost!",
  };

  game.player1.socket.emit('gameOver', packet);
  game.player2.socket.emit('gameOver', packet);
}

// 게임 종료 요청 처리
function handleGameEnd(socket, packet) {
  // 게임 종료 로직
  const { userId, finalScore } = packet;
  // TODO: 유저의 최종 점수를 데이터베이스에 저장하는 로직 추가

  socket.emit('gameEnd', { success: true });
}


// 게임 상태 동기화
function sendGameSync(game) {
  const gameState = {
    player1: {
      baseHp: game.player1.base.hp,
      // 기타 상태 정보들
    },
    player2: {
      baseHp: game.player2.base.hp,
      // 기타 상태 정보들
    }
  };
  game.player1.socket.emit('gameSync', gameState);
  game.player2.socket.emit('gameSync', gameState);
}

function someGameFunction(game) {
  // 게임 로직...

  // 상태 동기화 호출
  
  sendGameSync(game);

  // 게임 오버 로직 예시
  if (game.player1.baseHp <= 0) {
    sendGameOver(game, false); // player1 패배
  } else if (game.player2.baseHp <= 0) {
    sendGameOver(game, true); // player1 승리
  }
}

module.exports = { someGameFunction, handleMonsterAttack, handleBaseHpUpdate, handleGameEnd, sendGameSync, sendGameOver  };
