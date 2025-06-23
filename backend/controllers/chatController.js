const Chat = require('../models/Chat');
const User = require('../models/User');


module.exports.createChat = async (req, res) => {
    const userId = req.user.id;
    const { targetId } = req.body;

    const user = await User.findById(userId);
    if (!user.friends.includes(targetId)) {
        return res.status(403).json({ success: false, message: 'You can only chat with friends.' });
    }

    let chat = await Chat.findOne({
        users: { $all: [userId, targetId] }
    });

    if (!chat) {
        chat = await Chat.create({ users: [userId, targetId] });
    }

    res.status(200).json(chat);
}