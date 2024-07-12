import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import UsersRouter from './routes/user.router.js';
import cors from 'cors';

const app = express();
const server = createServer(app);

const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
initSocket(server); // 소켓 추가
app.use(express.static('client'));
app.use('/api', [UsersRouter]);


app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

server.listen(PORT, async () => {
  const address = server.address();
  const host = address.address === '::' ? 'localhost' : address.address; // IPv6의 ::는 localhost를 의미함
  const port = address.port;
  console.log(`Server가 http://${host}:${port} 에서 열렸습니다`);
});
