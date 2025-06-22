const Message = require('../models/Message');
const Chat = require('../models/Chat');
const path = require('path');


module.exports.sendMessage = async (req, res) => 
{
    try 
    {
        const {chatId, content} = req.body;
        const senderId = req.user.id;

        if(!chatId || !content) 
        {
            return res.status(400).json({
                success: false,
                message: 'chat id and content are required'
            });
        }

        const message = await Message.create({
            chat: chatId,
            sender: senderId,
            content
        });

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id
        });

        const fullMsg = await message
                    .populate('sender', 'username avtar')
                    .populate('chat');
        
        return res.json({
            fullMsg
        }).status(200);
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: `Server error : ${error.message}`
        })
    }
}

module.exports.sendFileMessage = async (req, res) => 
{
    try {
        const senderId = req.user.id;
        const {chatId} = req.body;

        if(!chatId || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'chatId and file is required.'
            });
        }

        const file = req.file;
        const ext = path.extname(file.originalname).toLowerCase();

        const fileType = ext.includes('.jpg') || ext.includes('.png') || ext.includes('.jpeg') || ext.includes('.avif') || ext.includes('.webp')  ? 'image' :
                     ext.includes('.pdf') ? 'pdf' :
                     ext.includes('.doc') ? 'doc' :
                     ext.includes('.mp4') ? 'video' : 'other';

        const message = await Message.create({
            chat: chatId,
            sender: senderId,
            file: file,
            fileType
        });

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id
        });

        const fullMsg = await message
                            .populate('sender', 'username avtar')
                            .populate('chat');

        return res.status(200).json({
            fullMsg
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: `Server error : ${error.message}`
        });
    }
}