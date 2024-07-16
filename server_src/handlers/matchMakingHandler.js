import { PacketType, RESOLUTION_HEIGHT, RESOLUTION_WIDTH } from '../constants.js';
import { createPlayData, GameData, getPlayData } from '../models/playData.model.js';
let queue = [];
function generateRandomMonsterPath() {
  const canvasHeight = RESOLUTION_HEIGHT;
  const canvasWidth = RESOLUTION_WIDTH;
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)
  path.push({ x: currentX, y: currentY });
  while (currentX < canvasWidth) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvasWidth) {
      currentX = canvasWidth;
    }
    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
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
  
  // const alreadyInQueue = queue.some(user=>user.userId ===userId);

  // if(alreadyInQueue){
  //   console.log(`${userId}유저 아이디는 이미 대기열에 있습니다`);
  //   return;
  // }

  // socket.emit('event',{
  //   packetType:PacketType.S2C_MATCH_FOUND_NOTIFICATION,
  //   message: '이미 대기열에 있는 아이디 입니다'
  // });

  
  queue.push({ socket, userId });
  console.log(`현재 대기열 상태: ${queue.map((user) => user.userId).join(', ')}`);
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();

    if(player1.userId ===player2.userId){
      console.log(`Player 1 : ${player1.userId} & Player 2 : ${player2.userId}`);
      queue.unshift(player2);
    }
  
    console.log(`매칭 성공: ${player1.userId} vs ${player2.userId}`);
    
    
    const packet = {
      packetType: PacketType.S2C_MATCH_FOUND_NOTIFICATION,
      opponentId: player2.userId,
    };

    const player1MonsterPath = generateRandomMonsterPath();
    const player2MonsterPath = generateRandomMonsterPath();
    let player1InitialTowerCoords = [];
    let player2InitialTowerCoords = [];

    for (let i = 0; i < 5; i++) {
      player1InitialTowerCoords.push(getRandomPositionNearPath(200, player1MonsterPath));
      player2InitialTowerCoords.push(getRandomPositionNearPath(200, player2MonsterPath));
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
      ),
    );

    const player1Payload = getPlayData(player1.userId);
    const player2Payload = getPlayData(player2.userId);

    player1.socket.emit('event', packet, player1Payload);
    player2.socket.emit('event', { ...packet, opponentId: player1.userId }, player2Payload);
  }
}

export { handleMatchRequest };
