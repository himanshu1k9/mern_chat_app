const express      = require('express');
const dotEnv       = require('dotenv');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const http         = require('http');
const { Server }   = require('socket.io');

dotEnv.config();
const chatApp       = express();
const server        = http.createServer(chatApp);

const io = new Server(server, 
{
    origin: process.env.CLIENT_URL,
    credentials: true
});

chatApp.use(cors({ 
     origin: process.env.CLIENT_URL, 
     credentials: true 
    }));

chatApp.use(express.json());
chatApp.use(cookieParser);

chatApp.use('/api/auth', require('./routes/authRoutes'));

io.on('connection', (socket) => {
    console.log(`User connected :: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected :: ${socket.id}`);
    })
})

const connectDB = require('./config/db');
connectDB();

module.exports.startServer = async () => {
    try
    {
        const port = process.env.APP_PORT || 8000;
        server.listen(port, () => console.log(`Server is up and running on port :: ${port}`));
    } catch(err) {
        console.log(`Error while starting the server, :: ${err}`);
    }
}
