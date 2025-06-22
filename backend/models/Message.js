const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: [true, 'chat id is required.']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'sender id is required.']
    },
    content: {
        type: String,
        default: ''
    },
    file: {
        type: String,
        default: ''
    },
    fileType: {
        type: String,
        enum: ['image', 'pdf', 'doc', 'video', 'audio', 'other'],
        default: ''
    },
}, {timestamps: true});

module.exports = mongoose.model('Message', messageSchema);