const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (userId) => 
{
    return jwt.sign({id: userId}, process.env.JWT_SECRET, 
    {
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

    const emailRegEx = /^\S+@\S+\.\S+$/;
    if(!emailRegEx.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email.'
        });
    }

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    try {
        const existingUser = await userModel.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            if (existingUser.isDeactivated) {
                return res.status(403).json({ success: false, message: 'This account is deactivated. Contact support.' });
            } else {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
        }

        const newUser = new userModel({
            username,
            email,
            password,
            avtar: avtar
        });

        await newUser.save();
        const token = generateToken(newUser._id);

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


module.exports.loginUser = async (req, res) => 
{
    try {
        const { email, password } = req.body;

        if(!email || !password) {
             return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await userModel.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'User does not exist' });

         if (user.isDeactivated) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Incorrect password' });

        const token = generateToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: { name: user.username, email: user.email }
        });

    } catch(error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

module.exports.getMe = async (req, res) => {
    
}

exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};