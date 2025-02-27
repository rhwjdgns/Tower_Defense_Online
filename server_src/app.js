import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './utils/prisma/index.js';
import initSocket from './init/socket.js';
import cors from 'cors';

// __dirname을 ES 모듈에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const PORT = 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

//현재 접속한 유저들의 세션 담기
export const activeSessions = {};

// 특정 도메인만 허용하는 CORS 설정
const corsOptions = {
  origin: '*', // 허용하고자 하는 도메인
  allowedHeaders: ['Content-type', 'Authorization'], // JWT
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // CORS 미들웨어 사용

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../client') });
});

// 회원가입 처리 엔드포인트
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        userId: username,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        userId: username,
        userPw: hashedPassword,
      },
    });

    const token = jwt.sign({ id: newUser.userId }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 로그인 처리 엔드포인트
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: username,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.userPw);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    //중복 로그인 방지 
    if (activeSessions[user.userId]) {
      return res.status(400).json({ message: 'User already logged in' });
    }

    const token = jwt.sign({ id: user.userId }, JWT_SECRET, {
      expiresIn: '1h',
    });

    activeSessions[user.userId] = token;

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/saveScore', async (req, res) => {
  const { userId, score } = req.body;
  console.log(`Saving score for user: ${userId}, score: ${score}`);

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: { userInfo: true },
    });

    let highScore = 0;
    
    console.log(`Current high score: ${highScore}`);
    if (user.userInfo === null) {
      prisma.userInfo.create({
        data: {
          userId: userId,
          highScore: '0'
        }
      })
    } else {
      highScore = user.userInfo.highScore || 0;
    }

    if (score > highScore) {
      await prisma.userInfo.update({
        where: { userId },
        data: { highScore: toString(score) },
      });
      console.log(`New high score set for user: ${userId}, score: ${score}`);
    }

    res.status(200).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getHighScore', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userInfo: { select: { highScore: true } } },
    });

    res.status(200).json({ highScore: user?.userInfo?.highScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 소켓 초기화
initSocket(server);

server.listen(PORT, async () => {
  const address = server.address();
  const host = address.address === '::' ? 'localhost' : address.address; // IPv6의 ::는 localhost를 의미함
  const port = address.port;
  console.log(`Server가 http://${host}:${port} 에서 열렸습니다`);
});
