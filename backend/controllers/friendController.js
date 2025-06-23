const User = require('../models/User');


module.exports.sendFriendRequest = async (req, res) => {
    const senderId = req.user.id;
    const {receiverId} = req.body;

    if(senderId === receiverId) {
        return res.status(400).json({
            success: false,
            message: "You can't send request to yourself"
        })
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if(!receiver) {
        return res.status(400).json({
            success: false,
            message: 'User not found'
        });
    }

    if(receiver.friends.includes(senderId)) {
        return res.status(400).json({
            success: false,
            message: 'Already friend'
        });
    }

    if(receiver.pendigRequests.includes(senderId)) {
        return res.status(400).json({
            success: false,
            message: 'Request already sent.'
        });
    }

    receiver.pendigRequests.push(senderId);
    sender.sendRequests.push(receiverId);

    await receiver.save();
    await sender.save();

    return res.status(200).json({
        success: true,
        message: 'Friend Request Sent.'
    })
}


module.exports.acceptFriendRequest = async (req, res) => {
    const receiverId = req.user.id;
    const {senderId} = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if(!receiver || !sender) {
        return res.status(400).json({
            success: false,
            message: 'User not found'
        });
    }

    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    receiver.pendigRequests = receiver.pendigRequests.filter(id => id.toString() !== senderId);
    sender.sendRequests = sender.sendRequests.filter(id => id.toString() !== receiverId);

    await receiver.save();
    await sender.save();

    return res.status(200).json({
        success: true,
        message: 'Friend Request accepted.'
    });
}

module.exports.declineFriendRequest = async (req, res) => 
{
    const receiverId = req.user.id;
    const {senderId} = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    receiver.pendigRequests = receiver.pendigRequests.filter(id => id.toString() !== senderId);
    sender.sendRequests = sender.sendRequests.filter(id => id.toString() !== receiverId);

    await receiver.save();
    await sender.save();

    return res.status(200).json({
        success: false,
        message: 'Friend Request Declined.'
    });
}



