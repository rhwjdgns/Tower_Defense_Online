const { PacketType } = require('../constants');

// 상태 동기화 패킷 생성 및 전송
function sendGameSync(game) {
  const packet = {
    packetType: PacketType.S2C_GAMESYNC,
    playerData: {
      userGold: game.player1.gold,
      baseHp: game.player1.baseHp,
      score: game.player1.score,
      monsters: game.player1.monsters.map(monster => ({
        x: monster.x,
        y: monster.y,
        hp: monster.hp,
        monsterNumber: monster.monsterNumber
      })),
      towers: game.player1.towers.map(tower => ({
        x: tower.x,
        y: tower.y
      }))
    },
    opponentData: {
      baseHp: game.player2.baseHp,
      monsters: game.player2.monsters.map(monster => ({
        x: monster.x,
        y: monster.y,
        hp: monster.hp,
        monsterNumber: monster.monsterNumber
      })),
      towers: game.player2.towers.map(tower => ({
        x: tower.x,
        y: tower.y
      }))
    }
  };

  game.player1.socket.emit('gameSync', packet);
  game.player2.socket.emit('gameSync', packet);
}

module.exports = { sendGameSync };
