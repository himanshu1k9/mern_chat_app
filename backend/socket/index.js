const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { v4:uuid } = require('uuid');

const userSocketMap = new Map();
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

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
    });

    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

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

    socket.on('group-created', (groupData) => {
      groupData.users.forEach(user => {
        if (user._id !== socket.user._id && user.socketId) {
          io.to(user.socketId).emit('group-added', groupData);
        }
      });
    });

    socket.on('send-message', async ({ chatId, content, sender }) => {
      if (!chatId || !content || !sender) return;

      const message = await Message.create({
        chat: chatId,
        sender,
        content
      });

      const chat = await Chat.findById(chatId);
      chat.users.forEach(userId => {
        if (userId.toString() !== sender) {
          const current = chat.unreadCount.get(userId.toString()) || 0;
          chat.unreadCount.set(userId.toString(), current + 1);
        }
      });

      chat.lastMessage = message._id;
      await chat.save();

      const populatedMsg = await message
        .populate('sender', 'username avtar')
        .populate('chat');
      io.to(chatId).emit('receive-message', populatedMsg);
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
