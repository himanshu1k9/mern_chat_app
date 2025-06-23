const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Provided username already exists.'],
        trim: true,
        minlength: [3, 'minimum 3 characters required for the name field.'],
        maxlength: [50, 'Name field should not more than 50 characters.']
    },
    email: {
        type: String,
        required: [true, 'email field is required.'],
        unique: [true, 'provided email is already exists.'],
        lowercase: [true, 'email shuld be in lowercase.'],
        match: [/^\S+@\S+\.\S+$/, 'Provie valid email address.']
    },
    password: {
        type: String,
        minlength: [6, 'Password should not less than 6 characters.'],
        maxlength: [10, 'Password should not more than 10 characters.'],
        required: [true, 'Password field is required.']
    },
    avtar: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: null
    },
    socketId: {
        type: String,
        default: null
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendigRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    sendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true } );

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    try
    {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error) {
        next(error);
    }
});

const model = mongoose.model('User', userSchema);
module.exports = model;

