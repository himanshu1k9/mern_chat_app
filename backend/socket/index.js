const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Map to store userId => socketId
const userSocketMap = new Map();

// Helper function to get socket ID of a user by userId
const getUserSocket = (userId) => {
  return userSocketMap.get(userId.toString());
};

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log(`User connected :: ${socket.id}`);

    const user = socket.user;

    if (user?._id) {
      userSocketMap.set(user._id.toString(), socket.id);

      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        socketId: socket.id
      });
      socket.broadcast.emit('user-online', user._id);
    }

    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('typing', {
        chatId,
        userId: user._id
      });
    });

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('stop-typing', {
        chatId,
        userId: user._id
      });
    });

    socket.on('friend-request-sent', ({ to }) => {
      const targetSocketId = getUserSocket(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-request', {
          from: socket.user._id
        });
      }
    });

    socket.on('send-message', async ({ chatId, content }) => {
      try {
        const msg = await Message.create({
          chat: chatId,
          sender: user._id,
          content
        });

        const chat = await Chat.findById(chatId).populate('users');

        chat.users.forEach((u) => {
          const recipientSocketId = getUserSocket(u._id);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-message', msg);
          }
        });
      } catch (err) {
        console.error("Error sending message:", err.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected :: ${socket.id}`);

      if (user?._id) {
        userSocketMap.delete(user._id.toString());
        await User.findByIdAndUpdate(user._id, {
          isOnline: false,
          socketId: null,
          lastSeen: new Date()
        });

        socket.broadcast.emit('user-offline', user._id);
      }
    });
  });
};
