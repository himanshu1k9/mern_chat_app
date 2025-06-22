// socket/index.js
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log(`User connected :: ${socket.id}`);

    const user = socket.user;

    if (user?._id) {
      await User.findByIdAndUpdate(user._id, { isOnline: true, socketId: socket.id });
      socket.broadcast.emit('user-online', user._id);
    }

    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('typing', { chatId, userId: user._id });
    });

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('stop-typing', { chatId, userId: user._id });
    });

    socket.on('send-message', async ({ chatId, content }) => {
      const msg = await Message.create({
        chat: chatId,
        sender: user._id,
        content
      });

      const chat = await Chat.findById(chatId).populate('users');
      chat.users.forEach((u) => {
        if (u.socketId) {
          io.to(u.socketId).emit('new-message', msg);
        }
      });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected :: ${socket.id}`);
      if (user?._id) {
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
