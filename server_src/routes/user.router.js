import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

//회원가입 API
router.post('/sign-up', async (req, res, next) => {
  const { id, password } = req.body;

  try {
    if (!id || !password) {
      return res.status(400).json({ message: '아이디와 비밀번호를 올바르게 입력해주세요' });
    }

    // 아이디와 비밀번호 조건
    if (id.length <= 3 || password.length <= 3) {
      return res.status(400).json({ message: '아이디와 비밀번호는 3자 이상으로 만들어주세요.' });
    }
    if (id.length >= 10 || password.length >= 10) {
      return res.status(400).json({ message: '아이디와 비밀번호는 10자 이하로 만들어주세요.' });
    }

    // userId가 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({ where: { userId } });

    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        id,
        password: hashedPassword,
      },
    });

    // 회원가입 성공 메시지 반환
    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

//로그인 API
router.post('/login', async (req, res, next) => {
    const { id, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user){
        return res.status(401).json({message:"존재하지 않는 아이디입니다."});
      }
  
      if (!bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: '비밀번호가 잘못되었습니다.' });
      }

  
      const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET_KEY, 
        {expiresIn: '1h'}
        );
      res.header("authorization",`Bearer ${token}`)
      res.status(201).json({ accessToken: token ,userId: user.id});
    } catch (error) {
      res.status(500).json({ message: '서버 오류' });
    }
  });

  export default router;