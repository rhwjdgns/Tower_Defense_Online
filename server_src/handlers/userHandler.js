import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';
import { v4 as uuidv4 } from 'uuid';

// const router = express.Router();

//* 회원가입 *//
 export const handleRegister = async(socket, data)=>{
    const {userId:username, userPw:password}= data;
  try {
    
    const existingUser = await prisma.user.findUnique({ where: { userId:username } });

    if(existingUser){
        socket.emit('registerResponse',{success:false,message:'이미 사용중인 아이디입니다'});
        return;
    }

    if (!username || !password) {
      return res.status(400).json({ message: '아이디와 비밀번호를 올바르게 입력해주세요' });
    }

    // 아이디와 비밀번호 조건
    if (userId.length <= 3 || userPw.length <= 3) {
      return res.status(400).json({ message: '아이디와 비밀번호는 3자 이상으로 만들어주세요.' });
    }
    if (userId.length >= 10 || userPw.length >= 10) {
      return res.status(400).json({ message: '아이디와 비밀번호는 10자 이하로 만들어주세요.' });
    }


    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        userId: username,
        userPw: hashedPassword,
      },
    });


    socket.emit('registerResponse',{success:true, message:'회원가입 성공'});
      } catch (error) {
    res.status(500).json({ message: '서버 오류' });
  }
    socket.emit('registerResponse',{success:false,message:'회원가입 실패'});
};

//* 로그인 *//
export const handleLogin= async(socket, data)=> {
    const {username, password}= data;
  
    try {
      const user = await prisma.user.findUnique({ where: { userId:username } });

      if (!user){
        return res.status(401).json({message:"존재하지 않는 아이디입니다."});
      }
  
      if (!bcrypt.compare(password, user.userPw)) {
        return res.status(401).json({ message: '비밀번호가 잘못되었습니다.' });
      }

      const token = jwt.sign({ id: user.userId, username }, JWT_SECRET, { expiresIn: '1h' });
      socket.emit('loginResponse', { 
        success: true, 
        message: `Welcome back ${userId}`,
        token 
      });
    } catch (error) {
      console.error('이미 다른 사람이 로그인 중입니다.:', error);
      socket.emit('loginResponse', { 
        success: false, 
        message: 'Login failed' 
      });
    }
  }

//   module.exports= {handleLogin,handleRegister};
export default {handleLogin,handleRegister}