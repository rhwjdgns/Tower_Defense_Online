import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import UsersRouter from './routes/users.router.js';

const app = express();
const server = createServer(app);

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
initSocket(server); // 소켓 추가
app.use(express.static('tower_defense_client'));
app.use('/api', [UsersRouter]);

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
