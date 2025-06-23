const Chat = require('../models/Chat');
const User = require('../models/User');


module.exports.createGroupChat = async (req, res) => {
  try {
    const { groupName, users } = req.body;
    const creatorId = req.user.id;

    if (!groupName || !users || users.length < 2) {
      return res.status(400).json({ success: false, message: 'Group name and at least 2 users required.' });
    }

    const groupChat = await Chat.create({
      groupName,
      isGroupChat: true,
      users: [...users, creatorId],
      groupAdmin: creatorId
    });

    const fullGroup = await groupChat.populate('users', 'username email avtar').populate('groupAdmin', 'username');
    res.status(201).json(fullGroup);
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
};

exports.renameGroup = async (req, res) => {
  const { chatId, newName } = req.body;
  const userId = req.user.id;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat) return res.status(404).json({ message: 'Group not found' });

  if (chat.groupAdmin.toString() !== userId) {
    return res.status(403).json({ message: 'Only group admin can rename the group' });
  }

  chat.groupName = newName;
  await chat.save();

  res.status(200).json(chat);
};

exports.addToGroup = async (req, res) => {
  const { chatId, userIdToAdd } = req.body;
  const chat = await Chat.findById(chatId);

  if (chat.groupAdmin.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only admin can add members' });
  }

  if (!chat.users.includes(userIdToAdd)) {
    chat.users.push(userIdToAdd);
    await chat.save();
  }

  res.status(200).json(chat);
};

exports.removeFromGroup = async (req, res) => {
  const { chatId, userIdToRemove } = req.body;
  const chat = await Chat.findById(chatId);

  if (chat.groupAdmin.toString() !== req.user.id && req.user.id !== userIdToRemove) {
    return res.status(403).json({ message: 'Only admin or self can remove' });
  }

  chat.users = chat.users.filter(uid => uid.toString() !== userIdToRemove);
  await chat.save();

  res.status(200).json(chat);
};