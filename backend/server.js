const express      = require('express');
const dotEnv       = require('dotenv');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const http         = require('http');
const { Server }   = require('socket.io');
const path         = require('path');
const connectDB    = require('./config/db');

dotEnv.config();
const chatApp       = express();
const server        = http.createServer(chatApp);

const io = new Server(server, 
{
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

chatApp.use(cors({ 
     origin: process.env.CLIENT_URL, 
     credentials: true 
    }));

chatApp.use(express.urlencoded({extended:true}));
chatApp.use(express.json());
chatApp.use(cookieParser());

chatApp.use('/api/auth', require('./routes/authRoutes'));
chatApp.use('/uploades', express.static(path.join(__dirname, 'uploads')));

io.on('connection', (socket) => {
    console.log(`User connected :: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected :: ${socket.id}`);
    })
})

module.exports.startServer = async () => {
    try
    {   
        await connectDB();
        const port = process.env.APP_PORT || 8000;
        server.listen(port, () => console.log(`Server is up and running on port :: ${port}`));
    } catch(err) {
        console.log(`Error while starting the server, :: ${err}`);
    }
}
