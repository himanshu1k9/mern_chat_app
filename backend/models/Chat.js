const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'the user id field is required.']
        }
    ],
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {timestamps: true});

module.exports = mongoose.model('Chat', chatSchema);