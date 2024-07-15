import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const handleRegister = async (userId, payload) => {
  const { username, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: {
      userId: username
    }
  });

  if (existingUser) {
    return { status: 'fail', message: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      userId: username,
      userPw: hashedPassword
    }
  });

  const token = jwt.sign({ id: newUser.userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return { status: 'success', message: 'User registered successfully', token };
};

export const handleLogin = async (userId, payload) => {
  const { username, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      userId: username
    }
  });

  if (!user) {
    return { status: 'fail', message: 'User not found' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.userPw);

  if (!isPasswordValid) {
    return { status: 'fail', message: 'Invalid password' };
  }

  const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return { status: 'success', message: 'Login successful', token };
};
