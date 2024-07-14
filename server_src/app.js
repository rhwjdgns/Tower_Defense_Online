import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import initSocket from './init/socket.js';
// import UsersRouter from './routes/user.router.js';
import cors from 'cors';

const app = express();
const server = createServer(app);

const PORT = 8080;

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
initSocket(server); // 소켓 추가
app.use(express.static('client'));
// app.use('/api', [UsersRouter]);

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
