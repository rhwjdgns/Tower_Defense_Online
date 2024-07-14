import { PacketType, serverSocket, ProtocolBuffer } from './protocol.js';

export class Monster {
  constructor(path, monsterImages, level, monsterNumber) {
    if (!path || path.length <= 0) {
      throw new Error("몬스터가 이동할 경로가 필요합니다.");
    }

    this.monsterNumber = monsterNumber ?? Math.floor(Math.random() * monsterImages.length);
    this.path = path;
    this.currentIndex = 0;
    this.x = path[0].x;
    this.y = path[0].y;
    this.width = 40;
    this.height = 40;
    this.speed = 2;
    this.image = monsterImages[this.monsterNumber];
    this.level = level;
    this.init(level);
  }

  init(level) {
    this.maxHp = 100 + 10 * level;
    this.hp = this.maxHp;
    this.attackPower = 10 + 1 * level;
  }

  move() {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];
      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        this.currentIndex++;
      } else {
        this.x += (deltaX / distance) * this.speed;
        this.y += (deltaY / distance) * this.speed;
      }
      return false;
    } else {
      this.hp = 0;
      this.attackBase();
      return true;
    }
  }

  attackBase() {
    let attackPacket = {
      packetType: PacketType.C2S_MONSTER_ATTACK_BASE,
      monsterId: this.monsterNumber,
      damage: this.attackPower
    };
    serverSocket.send(ProtocolBuffer.encode(attackPacket));
  }

  draw(ctx, isOpponent = false) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (!isOpponent) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(
        `(레벨 ${this.level}) ${this.hp}/${this.maxHp}`,
        this.x,
        this.y - 5
      );
    }
  }
}
