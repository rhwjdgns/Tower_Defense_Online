import { sendGameSync } from './gameSyncHandler.js';
import { PacketType } from '../constants.js';
import { getPlayData } from '../models/playData.model.js';

let io;
const bases = {}; // 각 플레이어의 베이스 정보를 저장

function initializeBase(playerId, initialHp) {
  bases[playerId] = {
    hp: initialHp,
    maxHp: initialHp,
  };
  console.log(`Base initialized: Player ID: ${playerId}, HP: ${initialHp}`);
}

function startGame(player1Id, player2Id) {
  const initialHp = 100; // 초기 HP 값 설정
  initializeBase(player1Id, initialHp);
  initializeBase(player2Id, initialHp);

  const gameDataPlayer1 = {
    userGold: 500,
    baseHp: initialHp,
    opponentBaseHp: initialHp,
    // 기타 초기화 데이터
  };

  const gameDataPlayer2 = {
    userGold: 500,
    baseHp: initialHp,
    opponentBaseHp: initialHp,
    // 기타 초기화 데이터
  };

  // 클라이언트로 초기 데이터 전송
  io.to(player1Id).emit('initGame', gameDataPlayer1);
  io.to(player2Id).emit('initGame', gameDataPlayer2);
}

// 게임 오버 패킷 생성 및 전송
function sendGameOver(game, winner) {
  const loser = winner === game.player1 ? game.player2 : game.player1;

  const winnerPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: true,
    message: 'You won!',
  };

  const loserPacket = {
    packetType: PacketType.S2C_GAME_OVER_NOTIFICATION,
    isWin: false,
    message: 'You lost!',
  };

  winner.socket.emit('gameOver', winnerPacket);
  loser.socket.emit('gameOver', loserPacket);
}

// 게임 종료 요청 처리
function handleGameEnd(socket, packet) {
  const { userId, finalScore } = packet;
  // 유저의 최종 점수를 데이터베이스에 저장하는 로직 추가

  socket.emit('gameEnd', { success: true });
}

// Base HP 업데이트 처리
function handleBaseHpUpdate(socket, data) {
  const { userId, baseHp } = data;
  if (bases[userId]) {
    bases[userId].hp = baseHp;
    // 다른 클라이언트로 base HP 업데이트 브로드캐스트
    console.log(`Broadcasting base HP update: User ID: ${userId}, Base HP: ${baseHp}`);
    socket.broadcast.emit('event', {
      packetType: 'S2C_UPDATE_BASE_HP',
      userId: userId,
      baseHp: baseHp,
    });
  } else {
    console.log(`No base found for User ID: ${userId}`);
  }
}

// 몬스터 공격 처리
function handleMonsterBaseAttack(socket, userId, payload) {
  const playerData = getPlayData(userId);

  playerData.setBaseHp(playerData.getBaseHp() - payload.damage);
  sendGameSync(socket, userId, PacketType.S2C_UPDATE_BASE_HP, {playerBaseHp: playerData.getBaseHp()});
  // if (bases[playerId]) {
  //   bases[playerId].hp -= damage;
  //   if (bases[playerId].hp < 0) {
  //     bases[playerId].hp = 0;
  //   }

  //   io.emit('updateBaseHp', { playerId: playerId, hp: bases[playerId].hp });
  //   console.log(`Base attacked: Player ID: ${playerId}, Damage: ${damage}, New HP: ${bases[playerId].hp}`);

  //   // 추가: 상대 클라이언트에게 base HP 업데이트 이벤트 브로드캐스트
  //   io.emit('event', {
  //     packetType: PacketType.S2C_UPDATE_BASE_HP,
  //     userId: playerId,
  //     baseHp: bases[playerId].hp,
  //   });
  // }
}

function initialize(ioInstance) {
  io = ioInstance;
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    socket.on('baseHpUpdate', (data) => handleBaseHpUpdate(socket, data));
  });
}

export { handleGameEnd, sendGameOver, handleMonsterBaseAttack, initialize, initializeBase, startGame, handleBaseHpUpdate };
