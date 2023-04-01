const User =  require("../models/User")

const sendToUserFriends = async(userId, socket, onlineUsers) => {
    let user =  await User.findById(userId,['fName', 'lName', 'profilePicture', 'followings'])
    user = JSON.parse(JSON.stringify(user))
    for (const follow of user.followings) {
        socket.to(onlineUsers[follow]).emit("RECIEVE_SIGNED_FRIEND_USER", user)
    }
}

const offlineStatusSendToFriends =  async(userId, socket, onlineUsers) => {
    if (userId) {
        let user =  await User.findById(userId,['fName', 'lName', 'profilePicture', 'followings'])
        user = JSON.parse(JSON.stringify(user))
        for (const follow of user.followings) {
            socket.to(onlineUsers[follow]).emit("LOGOUT_FRIEND_USER", user._id)
        }
    }
    
}

const getOnlineFriends = async(userId, socket, onlineUsers, io) => {
    let user =  await User.findById(userId,['fName', 'lName', 'profilePicture', 'followings'])
    user = JSON.parse(JSON.stringify(user));
    console.log('====================================');
    console.log(user);
    console.log('====================================');
    let userFollowings =  await User.find({},['fName', 'lName', 'profilePicture']).where('_id').in(user.followings).exec();
    userFollowings = JSON.parse(JSON.stringify(userFollowings))
    let onlineFollowingUsers = []
    for (const user of userFollowings) {
        if (onlineUsers[user._id]) {
            onlineFollowingUsers.push(user)
        }
    }
    
    io.to(onlineUsers[userId]).emit("GET_USER_FRIENDS", onlineFollowingUsers)
}

module.exports = { sendToUserFriends, getOnlineFriends, offlineStatusSendToFriends}