const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'the user id field is required.']
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
}, {timestamps: true});

module.exports = mongoose.model('Chat', chatSchema);