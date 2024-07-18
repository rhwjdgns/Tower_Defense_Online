import { CLIENT_VERSION, INITIAL_TOWER_NUMBER, PacketType } from '../constants.js';
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
let intervalId = null; // 몬스터 생성 주기
let killCount = 0; // 몬스터 잡은 횟수
// 게임 데이터
let towerCost = 500;
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
let opponentBaseHp = 0;
let opponentMonsterPath;
let opponentInitialTowerCoords;
let opponentBasePosition;
let opponentMonsters = [];
let opponentTowers = [];
let isInitGame = false;
// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';
const opponentBackgroundImage = new Image();
opponentBackgroundImage.src = 'images/bg2.webp';
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
  if (!base) placeBase(basePosition, true);
  if (!opponentBase) placeBase(opponentBasePosition, false);
  towerIndex += INITIAL_TOWER_NUMBER;
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
  for (let i = 0; path && i < path.length - 1; i++) {
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
  const posY = startY + t * (endY - endY);
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

  sendEvent(PacketType.C2S_TOWER_BUY, { x, y, level: 1, towerIndex, towerCost });
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

  attackedMonster.setHp(monsterValue.hp);
  attackedTower.attack(attackedMonster);
}

function placeBase(position, isPlayer) {
  if (isPlayer) {
    if (!base) {
      base = new Base(position.x, position.y, baseHp);
      base.draw(ctx, baseImage);
    }
  } else {
    if (!opponentBase) {
      opponentBase = new Base(position.x, position.y, baseHp);
      opponentBase.draw(opponentCtx, baseImage, true);
    }
  }
}
function spawnMonster() {
  const monster = new Monster(monsterPath, monsterImages, monsterLevel);
  monster.setMonsterIndex(monsterIndex);
  monsters.push(monster);

  sendEvent(PacketType.C2S_SPAWN_MONSTER, { hp: monster.getMaxHp(), monsterIndex, monsterLevel });
  monsterIndex++;
  // TODO. 서버로 몬스터 생성 이벤트 전송
}
function spawnOpponentMonster(value) {
  const newMonster = new Monster(
    opponentMonsterPath,
    monsterImages,
    value[value.length - 1].monsterLevel,
  );
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
  // 예외 처리 부분
  score = data.score;
  userGold = data.gold;
  baseHp = data.baseHp;
  base.updateHp(baseHp);

  if (data.attackedMonster === undefined) {
    return;
  }

  const attackedMonster = monsters.find((monster) => {
    return monster.getMonsterIndex() === data.attackedMonster.monsterIndex;
  });

  if (attackedMonster) {
    attackedMonster.setHp(data.attackedMonster.hp);
  } else {
    console.error('Monster not found:', data.attackedMonster.monsterIndex);
  }
}
function gameLoop() {
  // 내 게임 캔버스 그리기
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
  base.draw(ctx, baseImage); // 내 기지 그리기

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const attackedBase = monster.move();
      monster.draw(ctx, false);
      if (attackedBase) {
        const attackedSound = new Audio('sounds/attacked.wav');
        attackedSound.volume = 0.3;
        attackedSound.play();
        monsters.splice(i, 1);
        sendEvent(PacketType.C2S_DIE_MONSTER, {
          monsterIndex: monster.getMonsterIndex(),
          score,
          monsterLevel: monster.level,
        });
        sendEvent(PacketType.C2S_MONSTER_ATTACK_BASE, { damage: monster.Damage() });

        // baseHp가 0이 되면 게임 오버
      if (baseHp <= 0) {
        serverSocket.emit('event', {
          packetType: PacketType.C2S_GAME_END_REQUEST,
          userId: localStorage.getItem('userId'),
          payload: { score }
        });
        return;
      }
      }
    } else {
      monsters.splice(i, 1);
      sendEvent(PacketType.C2S_DIE_MONSTER, {
        monsterIndex: monster.getMonsterIndex(),
        score,
        monsterLevel: monster.level,
      });
      killCount++;

      if (killCount === 10 && monsterSpawnInterval > 1000) {
        monsterSpawnInterval -= 500;
        monsterLevel++;
        killCount = 0;
        startSpawning();
      }
    }
  }

  // 상대 게임 캔버스 그리기
  opponentCtx.drawImage(opponentBackgroundImage, 0, 0, opponentCanvas.width, opponentCanvas.height);
  drawPath(opponentMonsterPath, opponentCtx);
  opponentTowers.forEach((tower) => {
    tower.draw(opponentCtx, towerImage);
    tower.updateCooldown();
  });
  opponentMonsters.forEach((monster) => {
    monster.move();
    monster.draw(opponentCtx, true);
  });
  if (opponentBase) {
    opponentBase.draw(opponentCtx, baseImage, true); // 상대 기지 다시 그리기
  }
  requestAnimationFrame(gameLoop);
}

//몬스터의 스폰주기 설정
function startSpawning() {
  // 기존 interval이 있다면 중지
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  // 새로운 interval 시작
  intervalId = setInterval(spawnMonster, monsterSpawnInterval);
}
function opponentBaseAttacked(value) {
  opponentBaseHp = value;
  opponentBase.updateHp(opponentBaseHp);
}
function initGame(payload) {
  if (isInitGame) {
    return;
  }

  fetch('/api/getHighScore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  .then((response) => response.json())
  .then((data) => {
    highScore = data.highScore || 0;
  })
  .catch((error) => console.error('Error fetching high score:', error));

  userGold = payload.userGold;
  baseHp = payload.baseHp;
  monsterPath = payload.monsterPath;
  initialTowerCoords = payload.initialTowerCoords;
  basePosition = payload.basePosition;
  opponentMonsterPath = payload.opponentMonsterPath;
  opponentInitialTowerCoords = payload.opponentInitialTowerCoords;
  opponentBasePosition = payload.opponentBasePosition;
  opponentBaseHp = payload.opponentBaseHp;
  opponentBase = new Base(opponentBasePosition.x, opponentBasePosition.y, baseHp);
  opponentBase.draw(opponentCtx, baseImage, true);
  opponentBaseHp = payload.baseHp;

  bgm = new Audio('sounds/bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0.2;
  bgm.play();
  initMap();
  startSpawning();
  gameLoop();
  isInitGame = true;
}
Promise.all([
  new Promise((resolve) => (opponentBackgroundImage.onload = resolve)),
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

    if (data.packetType === PacketType.S2C_GAME_OVER_NOTIFICATION) {
      console.log('Game over notification received:', data); 
      bgm.pause();
      const { isWin, message } = data;
      const winSound = new Audio('sounds/win.wav');
      const loseSound = new Audio('sounds/lose.wav');
      winSound.volume = 0.3;
      loseSound.volume = 0.3;
    
      const alertMessage = isWin ? 'Victory! ' : 'Defeat! ';
      const finalMessage = alertMessage + message;
    
      const soundToPlay = isWin ? winSound : loseSound;
      soundToPlay.play().then(() => {
        showAlertAndSaveScore(finalMessage);
      });
    }
  });
  
  function showAlertAndSaveScore(message) {
    const finalScore = score; // 최종 점수 저장
    fetch('/api/saveScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score: finalScore }),
    }).then(response => response.json())
      .then(data => {
        console.log('Score save response:', data);
        if (data.message === 'Score saved successfully') {
          console.log('Score saved successfully');
        } else {
          console.error('Failed to save score:', data.message);
        }
        showAlertAndRedirect(message);
      }).catch(error => {
        console.error('Error saving score:', error);
        showAlertAndRedirect(message);
      });
  }
  
  function showAlertAndRedirect(message) {
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'absolute';
    alertDiv.style.top = '50%';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translate(-50%, -50%)';
    alertDiv.style.padding = '20px';
    alertDiv.style.backgroundColor = 'white';
    alertDiv.style.border = '1px solid black';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.zIndex = '1000';
  
    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;
  
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.marginTop = '10px';
    okButton.style.padding = '5px 10px';
    okButton.style.fontSize = '16px';
    okButton.style.cursor = 'pointer';
    okButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  
    alertDiv.appendChild(alertMessage);
    alertDiv.appendChild(okButton);
    document.body.appendChild(alertDiv);
  }

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
      case PacketType.S2C_UPDATE_BASE_HP:
        opponentBaseAttacked(packet.data.opponentBaseHp);
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

function decycle(obj, stack = []) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (stack.includes(obj)) {
    return null; // 순환 참조를 제거하고 null로 대체
  }

  const newStack = stack.concat([obj]);

  if (Array.isArray(obj)) {
    return obj.map(item => decycle(item, newStack));
  }

  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = decycle(obj[key], newStack);
    return acc;
  }, {});
}

function sendEvent(handlerId, payload) {
  const decycledPayload = decycle(payload); // 순환 참조 제거
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    packetType: handlerId,
    payload: decycledPayload, // 순환 참조가 제거된 객체를 전송
  });
}
