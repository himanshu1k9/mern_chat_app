const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
}


module.exports.registerUser = async (req, res) => 
{
    const { username, email, password } = req.body;
    const avtar = req.file ? `/uploads/${req.file.filename}` : '';

    if(!username || !email || !password) {
        return res.json({
            success: false,
            message: 'All fields are required.'
        }).status(400);
    }

    try {
        const existingUser = await userModel.findOne({$or: [{email}, {username}]});
        if(existingUser) {
            return res.json({
                success: false,
                message: 'User already exists.'
            }).status(400);
        }

        const newUser = new userModel({
            username,
            email,
            password,
            avtar: avtar
        });

        await newUser.save();
        const token = generateToken(newUser._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            avtar: newUser.avtar
        });
    } catch(error) {
        return res.json({
            success: false,
            message: `Server error ${error}`
        }).status(500);
    }
}


module.exports.loginUser = async (req, res) => {

}

module.exports.getMe = async (req, res) => {
    
}