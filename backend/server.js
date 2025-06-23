
const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

dotEnv.config();

const chatApp = express();
const server = http.createServer(chatApp);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

require('./socket')(io);

chatApp.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

chatApp.use(express.urlencoded({ extended: true }));
chatApp.use(express.json());
chatApp.use(cookieParser());

chatApp.use('/uploades', express.static(path.join(__dirname, 'uploads')));

chatApp.use('/api/auth', require('./routes/authRoutes'));
chatApp.use('/api/message', require('./routes/messageRutes'));
chatApp.use('/api/friends', require('./routes/friendRoutes'));
chatApp.use('/api/groups', require('./routes/groupRoutes'));

module.exports.startServer = async () => {
  try {
    await connectDB();
    const port = process.env.APP_PORT || 8000;
    server.listen(port, () => console.log(`Server is running on port :: ${port}`));
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
  }
};
