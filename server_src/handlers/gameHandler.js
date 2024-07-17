
import { sendGameSync } from './gameSyncHandler.js';
import { PacketType } from '../constants.js';

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
  // 승 패 로직 추가 // 디비 저장 로직 추가 

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
function handleMonsterAttack(playerId, damage) {
  if (bases[playerId]) {
    bases[playerId].hp -= damage;
    if (bases[playerId].hp < 0) {
      bases[playerId].hp = 0;
    }
    io.emit('updateBaseHp', { playerId: playerId, hp: bases[playerId].hp });
    console.log(`Base attacked: Player ID: ${playerId}, Damage: ${damage}, New HP: ${bases[playerId].hp}`);

    // 추가: 상대 클라이언트에게 base HP 업데이트 이벤트 브로드캐스트
    io.emit('event', {
      packetType: PacketType.S2C_UPDATE_BASE_HP,
      userId: playerId,
      baseHp: bases[playerId].hp,
    });
  }
}

// 상태 동기화 호출
function handleGameSync(socket, data) {
  const game = data.game; // data에서 game 객체를 가져옵니다.
  sendGameSync(game);
  // 게임 오버 로직 예시
  if (game.player1.baseHp <= 0) {
    sendGameOver(game, game.player2); // player2 승리
  } else if (game.player2.baseHp <= 0) {
    sendGameOver(game, game.player1); // player1 승리
  }
}

function initialize(ioInstance) {
  io = ioInstance;
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    socket.on('baseHpUpdate', (data) => handleBaseHpUpdate(socket, data));
  });
}

export { handleGameEnd, handleGameSync, sendGameOver, handleMonsterAttack, initialize, initializeBase, startGame, handleBaseHpUpdate };
