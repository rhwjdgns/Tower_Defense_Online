import { Server as SocketIO } from 'socket.io';
import { handleRegister, handleLogin } from '../handlers/registerHandler.js';

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('register', async (data) => {
      const response = await handleRegister(socket.id, data);
      socket.emit('response', response);
    });

    socket.on('login', async (data) => {
      const response = await handleLogin(socket.id, data);
      socket.emit('response', response);
    });

    // 다른 이벤트 핸들러 여기에 추가해주세용
  });
};

const initSocket = (server) => {
  const io = new SocketIO(server);
  registerHandler(io);
};

export default initSocket;
