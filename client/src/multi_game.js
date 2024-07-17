import { CLIENT_VERSION, PacketType } from '../constants.js';
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
let monsterSpawnInterval = 3000;
let towerIndex = 1;
let monsterIndex = 1;
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
monsterPath = monsterPath || [];
initialTowerCoords = initialTowerCoords || [];
basePosition = basePosition || { x: 0, y: 0 };

opponentMonsterPath = opponentMonsterPath || [];
opponentInitialTowerCoords = opponentInitialTowerCoords || [];
opponentBasePosition = opponentBasePosition || { x: 0, y: 0 };
let bgm;
function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawPath(monsterPath, ctx);
  drawPath(opponentMonsterPath, opponentCtx);
  placeInitialTowers(initialTowerCoords, towers, ctx);
  placeInitialTowers(opponentInitialTowerCoords, opponentTowers, opponentCtx);
  placeBase(basePosition, true);
  placeBase(opponentBasePosition, false);

  towerIndex += 5;
}
function drawPath(path, context) {
  if (!path || path.length === 0) {
    console.error('Path is not defined or empty');
    return;
  }
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
  let initTowerIndex = 1;
  initialTowerCoords.forEach((towerCoords) => {
    const tower = new Tower(towerCoords.x, towerCoords.y);
    tower.setTowerIndex(initTowerIndex);
    initialTowers.push(tower);
    initTowerIndex++;

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
  tower.setTowerIndex(towerIndex);
  towers.push(tower);

  sendEvent(PacketType.C2S_TOWER_BUY, { x, y, level: 1, towerIndex });
  towerIndex++;
  tower.draw(ctx, towerImage);
}
function placeNewOpponentTower(value) {
  const newTowerCoords = value[value.length - 1];
  const newTower = new Tower(newTowerCoords.tower.X, newTowerCoords.tower.Y);
  newTower.setTowerIndex(newTowerCoords.towerIndex);
  opponentTowers.push(newTower);
}

function opponentTowerAttack(monsterValue, towerValue) {
  const attackedTower = opponentTowers.find((tower) => {
    return tower.getTowerIndex() === towerValue.towerIndex;
  });
  const attackedMonster = opponentMonsters.find((monster) => {
    return monster.getMonsterIndex() === monsterValue.monsterIndex;
  });

  attackedTower.attack(attackedMonster);
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
  const monster = new Monster(monsterPath, monsterImages, monsterLevel);
  monster.setMonsterIndex(monsterIndex);
  monsters.push(monster);

  sendEvent(PacketType.C2S_SPAWN_MONSTER, { hp: monster.getMaxHp(), monsterIndex });
  monsterIndex++;
  // TODO. 서버로 몬스터 생성 이벤트 전송
}
function spawnOpponentMonster(value) {
  const newMonster = new Monster(opponentMonsterPath, monsterImages, 0);
  newMonster.setMonsterIndex(value[value.length - 1].monsterIndex);
  opponentMonsters.push(newMonster);
}
function destroyOpponentMonster(index) {
  const destroyedMonsterIndex = opponentMonsters.findIndex((monster) => {
    return monster.getMonsterIndex() === index;
  });

  opponentMonsters.splice(destroyedMonsterIndex, 1);
}
function gameSync(data) {
  //예외 처리 부분
  if (data.attackedMonster === undefined) {
    return;
  }

  const attackedMonster = monsters.find((monster) => {
    return monster.getMonsterIndex() === data.attackedMonster.monsterIndex;
  });

  attackedMonster.setHp(data.attackedMonster.hp);
  console.log(
    `맞은 놈 번호 : ${attackedMonster.getMonsterIndex()}   갱신된 체력 : ${attackedMonster.getHp()}`,
  );
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
        const Attacked = tower.attack(monster);
        if (Attacked) {
          sendEvent(PacketType.C2S_TOWER_ATTACK, {
            damage: tower.getAttackPower(),
            monsterIndex: monster.getMonsterIndex(),
            towerIndex: tower.getTowerIndex(),
          });
        }
      }
    });
  });
  base.draw(ctx, baseImage);
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const Attacked = monster.move();
      monster.draw(ctx, false);
      if (Attacked) {
        const attackedSound = new Audio('sounds/attacked.wav');
        attackedSound.volume = 0.3;
        attackedSound.play();
        monsters.splice(i, 1);
        sendEvent(PacketType.C2S_DIE_MONSTER, { monsterIndex: monster.getMonsterIndex() });

        baseHp -= monster.Damage();
        base.takeDamage(monster.Damage());
        // baseHp가 0이되면 게임 오버, baseHp가 줄어들면 서버에 전달
      }
    } else {
      monsters.splice(i, 1);
      sendEvent(PacketType.C2S_DIE_MONSTER, { monsterIndex: monster.getMonsterIndex() });
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
function initGame(payload) {
  if (isInitGame) {
    return;
  }
  userGold = payload.userGold;
  baseHp = payload.baseHp;
  monsterPath = payload.monsterPath;
  initialTowerCoords = payload.initialTowerCoords;
  basePosition = payload.basePosition;
  opponentMonsterPath = payload.opponentMonsterPath;
  opponentInitialTowerCoords = payload.opponentInitialTowerCoords;
  opponentBasePosition = payload.opponentBasePosition;

  bgm = new Audio('sounds/bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.2;
  bgm.play();

  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)

  // 상태 동기화 요청
  sendGameSyncRequest();

  setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  //setInterval(sendGameSyncRequest, SYNC_INTERVAL); // 주기적으로 상태 동기화/
  gameLoop(); // 게임 루프 최초 실행
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

  //대결 신청
  //대결 신청
  serverSocket.on('connect', () => {
    serverSocket.emit('event', {
      packetType: 13, // C2S_MATCH_REQUEST
      userId: localStorage.getItem('userId'),
    });
    console.log('client checking: ', userId);
  });
  serverSocket.on('event', (data, payload) => {
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
            initGame(payload);
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
  // 상태 동기화 이벤트 수신
  serverSocket.on('gameSync', (packet) => {
    switch (packet.packetType) {
      case PacketType.S2C_ENEMY_TOWER_SPAWN:
        placeNewOpponentTower(packet.data.opponentTowers);
        break;
      case PacketType.S2C_ENEMY_TOWER_ATTACK:
        opponentTowerAttack(packet.data.attackedOpponentMonster, packet.data.attackedOpponentTower);
        break;
      case PacketType.S2C_ENEMY_SPAWN_MONSTER:
        spawnOpponentMonster(packet.data.opponentMonsters);
        break;
      case PacketType.S2C_ENEMY_DIE_MONSTER:
        destroyOpponentMonster(packet.data.destroyedOpponentMonsterIndex);
        break;
      case PacketType.S2C_GAMESYNC:
        gameSync(packet.data);
        break;
    }
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

function sendEvent(handlerId, payload) {
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    packetType: handlerId,
    payload,
  });
}
