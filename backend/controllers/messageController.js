const Message = require('../models/Message');
const Chat = require('../models/Chat');
const path = require('path');

exports.sendTextMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    if (!chatId || !content) {
      return res.status(400).json({
        success: false,
        message: 'chatId and content are required.'
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content: content
    });

    const chat = await Chat.findById(chatId);
    chat.users.forEach(userId => {
      if (userId.toString() !== senderId) {
        const currentUnread = chat.unreadCount.get(userId.toString()) || 0;
        chat.unreadCount.set(userId.toString(), currentUnread + 1);
      }
    });

    chat.lastMessage = message._id;
    await chat.save();

    const fullMsg = await message
      .populate('sender', 'username avtar')
      .populate('chat');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully.',
      data: fullMsg
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};


exports.sendFileMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { chatId } = req.body;

    if (!chatId || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'chatId and file are required.'
      });
    }

    const file = req.file;
    const fileUrl = `/chat_files/${file.filename}`;
    const ext = path.extname(file.originalname).toLowerCase();

    let fileType = 'other';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)) {
      fileType = 'image';
    } else if (ext === '.pdf') {
      fileType = 'pdf';
    } else if (['.doc', '.docx'].includes(ext)) {
      fileType = 'doc';
    } else if (ext === '.mp4') {
      fileType = 'video';
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      file: fileUrl,
      fileType
    });

    const chat = await Chat.findById(chatId);
    chat.users.forEach(userId => {
      if (userId.toString() !== senderId) {
        const currentUnread = chat.unreadCount.get(userId.toString()) || 0;
        chat.unreadCount.set(userId.toString(), currentUnread + 1);
      }
    });

    chat.lastMessage = message._id;
    await chat.save();

    const fullMsg = await message
      .populate('sender', 'username avtar')
      .populate('chat');

    return res.status(200).json({
      success: true,
      message: 'File message sent successfully.',
      data: fullMsg
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};
