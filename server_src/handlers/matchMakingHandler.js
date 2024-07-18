import { INITIAL_TOWER_NUMBER, PacketType, RESOLUTION_HEIGHT, RESOLUTION_WIDTH } from '../constants.js';
import { createPlayData, GameData, getPlayData } from '../models/playData.model.js';
import { createTowers, setTower } from '../models/tower.model.js';
let queue = [];
let CLIENTS = {};

function generateRandomMonsterPath() {
  const canvasHeight = RESOLUTION_HEIGHT;
  const canvasWidth = RESOLUTION_WIDTH;
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500;
  path.push({ x: currentX, y: currentY });
  while (currentX < canvasWidth) {
    currentX += Math.floor(Math.random() * 100) + 50;
    if (currentX > canvasWidth) {
      currentX = canvasWidth;
    }
    currentY += Math.floor(Math.random() * 200) - 100;
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvasHeight) {
      currentY = canvasHeight;
    }
    path.push({ x: currentX, y: currentY });
  }
  return path;
}

function getRandomPositionNearPath(maxDistance, monsterPath) {
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function handleMatchRequest(socket, data) {
  const { userId } = data;
  console.log(`매치 요청을 보낸 유저 ID: ${userId}`);
  
  // 접속한 유저를 대기열 queue 안에 푸쉬
  queue.push({ socket, userId });
  console.log(`현재 대기열 상태: ${queue.map((user) => user.userId).join(', ')}`);
  
  // 대기열에 2명 있으면 대기열에서 게임으로 푸쉬 
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();
    CLIENTS[player1.userId] = player1.socket;
    CLIENTS[player2.userId] = player2.socket;

    console.log(`매칭 성공: ${player1.userId} vs ${player2.userId}`);
    
    // 대기 시작 패킷 
    const packet = {
      packetType: PacketType.S2C_MATCH_FOUND_NOTIFICATION,
      opponentId: player2.userId,
    };
    // 타워 생성
    createTowers(player1.userId);
    createTowers(player2.userId);

    // 게임 초기값 (monster path, initial towers, game data)
    const initialHp = 100; // 초기 base HP 값
    const player1MonsterPath = generateRandomMonsterPath();
    const player2MonsterPath = generateRandomMonsterPath();
    let player1InitialTowerCoords = [];
    let player2InitialTowerCoords = [];

    for (let i = 0; i < INITIAL_TOWER_NUMBER; i++) {
      const towerCoords1 = getRandomPositionNearPath(200, player1MonsterPath);
      const towerCoords2 = getRandomPositionNearPath(200, player2MonsterPath);

      player1InitialTowerCoords.push(towerCoords1);
      player2InitialTowerCoords.push(towerCoords2);

      setTower(player1.userId, towerCoords1.x, towerCoords1.y, 1, i + 1);
      setTower(player2.userId, towerCoords2.x, towerCoords2.y, 1, i + 1);
    }

    createPlayData(
      player1.userId,
      new GameData(
        player1MonsterPath,
        player1InitialTowerCoords,
        player1MonsterPath[player1MonsterPath.length - 1],
        player2MonsterPath,
        player2InitialTowerCoords,
        player2MonsterPath[player2MonsterPath.length - 1],
        player2.userId
      ),
    );
    createPlayData(
      player2.userId,
      new GameData(
        player2MonsterPath,
        player2InitialTowerCoords,
        player2MonsterPath[player2MonsterPath.length - 1],
        player1MonsterPath,
        player1InitialTowerCoords,
        player1MonsterPath[player1MonsterPath.length - 1],
        player1.userId
      ),
    );

    const player1Payload = {
      ...getPlayData(player1.userId),
      baseHp: initialHp,
      opponentBaseHp: initialHp
    };
    const player2Payload = {
      ...getPlayData(player2.userId),
      baseHp: initialHp,
      opponentBaseHp: initialHp
    };
    
    // 대기 시작 & 게임 초기 값 packet & socket 전송
    player1.socket.emit('event', packet, player1Payload);
    player2.socket.emit('event', { ...packet, opponentId: player1.userId }, player2Payload);
  }
}

export { handleMatchRequest, CLIENTS };