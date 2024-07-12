import { prisma } from '../utils/prisma/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const users = [];

// 서버 메모리에 유저의 세션(소켓ID)을 저장
// 이때 유저는 객체 형태로 저장
// { uuid: string; socketId: string; };
export const addUser = (user) => {
  const data = {
    uuid: user.uuid,
    socketId: user.socketId,
  };
  users.push(data);
};

// 발급받은 uuid를 해당 유저 db 에 저장
export const updateUser = async (user) => {
  const userData = await authMiddleware(user.token);
  const { userId } = userData;
  await prisma.users.update({
    where: { userId: userId },
    data: {
      uuid: user.uuid,
    },
  });
};

// 배열에서 유저 삭제
export const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// 전체 유저 조회
export const getUsers = () => {
  return users;
};
