const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Provided username already exists.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email field is required.'],
        unique: [true, 'provided email is already exists.'],
        lowercase: [true, 'email shuld be in lowercase.']
    },
    password: {
        type: String,
        minlength: [6, 'Password should not less than 6 characters.'],
        maxlength: [10, 'Password should not more than 10 characters.']
    },
    avtar: {
        type: String,
        default: ''
    },
    online: {
        type: Boolean,
        default: false
    }
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

