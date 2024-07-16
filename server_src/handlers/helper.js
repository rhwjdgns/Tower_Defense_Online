import { CLIENT_VERSION } from '../constants.js';
import handlerMappings from './handlerMapping.js';
import { addUser } from '../models/user.model.js';


export const handleDisconnect = (socket, uuid) => {
  console.log(`User disconnected: ${socket.id}`);
};

export const handleConnection = async (socket, userUUID) => {
  console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
  socket.emit('connection', { uuid: userUUID, highScore: highScore });
};

export const handleEvent = async (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = await handler(data.userId, data.payload);
  if (response.broadcast) {
    io.emit('response', response);
    return;
  }
  socket.emit('response', response);
};