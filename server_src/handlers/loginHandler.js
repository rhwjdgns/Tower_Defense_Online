const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../utils/prisma/index.js');
const { PacketType } = require('../constants');
const { JWT_SECRET } = process.env;

async function handleLogin(socket, packet) {
  const { username, password } = packet;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.userPw)) {
      const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });

      socket.emit('loginResponse', {
        packetType: PacketType.S2C_LOGIN_RESPONSE,
        success: true,
        message: '로그인 성공',
        token,
      });
    } else {
      socket.emit('loginResponse', {
        packetType: PacketType.S2C_LOGIN_RESPONSE,
        success: false,
        message: '로그인 실패',
      });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    socket.emit('loginResponse', {
      packetType: PacketType.S2C_LOGIN_RESPONSE,
      success: false,
      message: '로그인 실패',
    });
  }
}

module.exports = { handleLogin };
