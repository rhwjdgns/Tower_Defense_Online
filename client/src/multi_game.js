import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
if (!localStorage.getItem('token')) {
  alert('로그인이 필요합니다.');
  location.href = '/login';
}
const userId = localStorage.getItem('userId');
if (!userId) {
  alert('유저 아이디가 필요합니다.');
  location.href = '/login';
}
let serverSocket;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const opponentCanvas = document.getElementById('opponentCanvas');
const opponentCtx = opponentCanvas.getContext('2d');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBarMessage = document.getElementById('progressBarMessage');
const progressBar = document.getElementById('progressBar');
const loader = document.getElementsByClassName('loader')[0];
const NUM_OF_MONSTERS = 5;
// 게임 데이터
let towerCost = 0;
let monsterSpawnInterval = 0;
// 유저 데이터
let userGold = 0;
let base;
let baseHp = 0;
let monsterLevel = 0;
let monsterPath;
let initialTowerCoords;
let basePosition;
let monsters = [];
let towers = [];
let score = 0;
let highScore = 0;
// 상대 데이터
let opponentBase;
let opponentMonsterPath;
let opponentInitialTowerCoords;
let opponentBasePosition;
let opponentMonsters = [];
let opponentTowers = [];
let isInitGame = false;
// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';
const towerImage = new Image();
towerImage.src = 'images/tower.png';
const baseImage = new Image();
baseImage.src = 'images/base.png';
const pathImage = new Image();
pathImage.src = 'images/path.png';
const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}
let bgm;
function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawPath(monsterPath, ctx);
  drawPath(opponentMonsterPath, opponentCtx);
  placeInitialTowers(initialTowerCoords, towers, ctx);
  placeInitialTowers(opponentInitialTowerCoords, opponentTowers, opponentCtx);
  placeBase(basePosition, true);
  placeBase(opponentBasePosition, false);
}
function drawPath(path, context) {
  const segmentLength = 10;
  const imageWidth = 30;
  const imageHeight = 30;
  const gap = 3;
  for (let i = 0; i < path.length - 1; i++) {
    const startX = path[i].x;
    const startY = path[i].y;
    const endX = path[i + 1].x;
    const endY = path[i + 1].y;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    for (let j = gap; j < distance - gap; j += segmentLength) {
      const x = startX + Math.cos(angle) * j;
      const y = startY + Math.sin(angle) * j;
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle, context);
    }
  }
}
function drawRotatedImage(image, x, y, width, height, angle, context) {
  context.save();
  context.translate(x + width / 2, y + height / 2);
  context.rotate(angle);
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
}
function getRandomPositionNearPath(maxDistance) {
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
function placeInitialTowers(initialTowerCoords, initialTowers, context) {
  initialTowerCoords.forEach((towerCoords) => {
    const tower = new Tower(towerCoords.x, towerCoords.y);
    initialTowers.push(tower);
    tower.draw(context, towerImage);
  });
}
function placeNewTower() {
  if (userGold < towerCost) {
    alert('골드가 부족합니다.');
    return;
  }
  const { x, y } = getRandomPositionNearPath(200);
  const tower = new Tower(x, y);
  towers.push(tower);
  tower.draw(ctx, towerImage);
}
function placeBase(position, isPlayer) {
  if (isPlayer) {
    base = new Base(position.x, position.y, baseHp);
    base.draw(ctx, baseImage);
  } else {
    opponentBase = new Base(position.x, position.y, baseHp);
    opponentBase.draw(opponentCtx, baseImage, true);
  }
}
function spawnMonster() {
  const newMonster = new Monster(monsterPath, monsterImages, monsterLevel);
  monsters.push(newMonster);
  // TODO. 서버로 몬스터 생성 이벤트 전송
}
function gameLoop() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawPath(monsterPath, ctx);
  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50);
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100);
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150);
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200);
  towers.forEach((tower) => {
    tower.draw(ctx, towerImage);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });
  base.draw(ctx, baseImage);
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const Attacked = monster.move();
      if (Attacked) {
        const attackedSound = new Audio('sounds/attacked.wav');
        attackedSound.volume = 0.3;
        attackedSound.play();
        monsters.splice(i, 1);
      }
    } else {
      monsters.splice(i, 1);
    }
  }
  opponentCtx.drawImage(backgroundImage, 0, 0, opponentCanvas.width, opponentCanvas.height);
  drawPath(opponentMonsterPath, opponentCtx);
  opponentTowers.forEach((tower) => {
    tower.draw(opponentCtx, towerImage);
    tower.updateCooldown();
  });
  opponentMonsters.forEach((monster) => {
    monster.move();
    monster.draw(opponentCtx, true);
  });
  opponentBase.draw(opponentCtx, baseImage, true);
  requestAnimationFrame(gameLoop);
}
function initGame() {
  if (isInitGame) {
    return;
  }
  bgm = new Audio('sounds/bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.2;
  bgm.play();
  initMap();
  setInterval(spawnMonster, monsterSpawnInterval);
  gameLoop();
  isInitGame = true;
}
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  serverSocket = io('http://localhost:8080', {
    auth: {
      token: localStorage.getItem('token'),
    },
  });
  serverSocket.on('connect_error', (err) => {
    if (err.message === 'Authentication error') {
      alert('잘못된 토큰입니다.');
      location.href = '/login';
    }
  });
  serverSocket.on('connect', () => {
    serverSocket.emit('event', {
      packetType: 13, // C2S_MATCH_REQUEST
      userId: localStorage.getItem('userId'),
    });
    console.log('client checking: ', userId);
  });
  serverSocket.on('event', (data) => {
    console.log(`서버로부터 이벤트 수신: ${JSON.stringify(data)}`);
    if (data.packetType === 14) {
      progressBarMessage.textContent = '게임이 3초 뒤에 시작됩니다.';
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 10;
        progressBar.value = progressValue;
        progressBar.style.display = 'block';
        loader.style.display = 'none';
        if (progressValue >= 100) {
          clearInterval(progressInterval);
          progressBarContainer.style.display = 'none';
          progressBar.style.display = 'none';
          buyTowerButton.style.display = 'block';
          canvas.style.display = 'block';
          opponentCanvas.style.display = 'block';
          if (!isInitGame) {
            initGame();
          }
        }
      }, 300);
    }
  });
  serverSocket.on('gameOver', (data) => {
    bgm.pause();
    const { isWin } = data;
    const winSound = new Audio('sounds/win.wav');
    const loseSound = new Audio('sounds/lose.wav');
    winSound.volume = 0.3;
    loseSound.volume = 0.3;
    if (isWin) {
      winSound.play().then(() => {
        alert('당신이 게임에서 승리했습니다!');
        sendGameEnd();
      });
    } else {
      loseSound.play().then(() => {
        alert('아쉽지만 대결에서 패배하셨습니다! 다음 대결에서는 꼭 이기세요!');
        sendGameEnd();
      });
    }
  });
  serverSocket.on('gameSync', (data) => {
    const { playerData, opponentData } = data;
    userGold = playerData.userGold;
    base.hp = playerData.baseHp;
    score = playerData.score;
    monsters = playerData.monsters;
    towers = playerData.towers;
    opponentBase.hp = opponentData.baseHp;
    opponentMonsters = opponentData.monsters;
    opponentTowers = opponentData.towers;
  });
});
const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';
buyTowerButton.style.display = 'none';
buyTowerButton.addEventListener('click', placeNewTower);
document.body.appendChild(buyTowerButton);
function sendGameEnd() {
  const packet = {
    packetType: PacketType.C2S_GAME_END_REQUEST,
    userId: localStorage.getItem('userId'),
    finalScore: score,
  };
  serverSocket.emit('gameEnd', packet);
}
