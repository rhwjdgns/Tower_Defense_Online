import { prisma } from '../utils/prisma/index.js';

const users = [];

// Add a user to the database when click "start game"
export const addUser = (user) => {
  users.push(user);
};

// Remove a user from the database
export const removeUser = (uuid) => {
  const index = users.findIndex((user) => user.uuid === uuid);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

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

// Get a user from the database by ID
export const getUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Get all users from the database
export const getUsers = () => {
  return users;
};
