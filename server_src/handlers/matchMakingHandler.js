import { getUser } from '../models/user.model.js';
import { PacketType } from '../constants.js';

const queue = [];

//** 대결신청 **//

// Add user to matchmaking queue
export const handleMatchRequest = async (socket, packet) => {
    const { userId } = packet;
    try {
      // Get the user from the database
      const user = await getUser(userId);
      if (user) {
        queue.push({ id: user.id, socket }); // Add user to the queue
        socket.emit('matchRequest', { 
            success: true, 
            message: 'Successfully joined the match queue.' });

        tryMatch();
      } else {
        socket.emit('matchRequest', { 
            success: false, 
            message: `User with ID ${userId} not found in the database.` });
      }
    } catch (error) {
      console.error('Error adding user to queue:', error);
      socket.emit('matchRequest', { 
        success: false, 
        message: 'Error adding user to queue.' });
    }
  };
  
  // Matching players in the queue
  function tryMatch() {
    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      handleMatchFound(player1, player2);
    }
  };


//** 대결시작 **//
export const handleMatchFound = (player1, player2) => {
  console.log(`Match started between ${player1.id} and ${player2.id}`);

  const packet = {
    packetType: PacketType.S2C_MATCH_FOUND_NOTIFICATION,
    opponent: player2,
  };

  player1.socket.emit('matchFound', packet);
  player2.socket.emit('matchFound', packet);

  // Ensure players are removed from the queue
  removeFromQueue(player1.socket);
  removeFromQueue(player2.socket);
};

// Remove user from the queue
function removeFromQueue(socket) {
  const index = queue.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    queue.splice(index, 1);
  }
};