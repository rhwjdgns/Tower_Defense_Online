import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (cookie) => {
  try {
    if (!cookie) throw new Error('토큰이 존재하지 않습니다.');

    const [tokenType, token] = cookie.split(' ');

    if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

    const decodedToken = jwt.verify(token, 'custom-secret-key');
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    return user;
  } catch (err) {
    console.log(err);
  }
};
