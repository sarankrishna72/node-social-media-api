const express = require("express");
const socialMediaApp = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const usersRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postsRoute = require("./routes/posts")
const conversationsRoute = require("./routes/conversations")
const messagesRoute = require("./routes/messages")
const { Server } = require('socket.io')

const upload = require("./libs/upload")
const path = require('path');

dotenv.config();

const cors = require('cors');
const { sendToUserFriends, getOnlineFriends, offlineStatusSendToFriends } = require("./libs/socket-user");

// use it before all route definitions



mongoose.connect(process.env.MONGO_BASE_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log("Connect to Mongo DB from local");
})


socialMediaApp.use("/public/images", express.static(path.join(__dirname, "public/images")))

// MiddleWare
socialMediaApp.use(cors({
    origin: '*'
}))



socialMediaApp.use(express.json());
socialMediaApp.use(helmet());
socialMediaApp.use(morgan("common"));


socialMediaApp.use("/api/users", usersRoute)
socialMediaApp.use("/api/auth", authRoute)
socialMediaApp.use("/api/posts", postsRoute)
socialMediaApp.use("/api/conversations", conversationsRoute)
socialMediaApp.use("/api/messages", messagesRoute)


socialMediaApp.post("/api/upload", upload.array("file"), (req, res) => {
    try {
        return res.status(200).json("Filed uploaded successfully")
    } catch (err) {
        console.log(err);
    }
})



const server = socialMediaApp.listen(5000, () => {
    console.log("Backend Server Running Check");
})



const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST"]
    }
})


let onlineUsers = { }

io.on("connection", (socket) => {
    socket.emit("me", socket.id);
    socket.on("LOGGED_IN", async(data) => {
        socket.join(data);
        onlineUsers = {...onlineUsers, ...{[data]: socket.id}} ;
        await sendToUserFriends(data, socket, onlineUsers);
    });



    socket.on("CHECK_USER_FRIENDS", async(data) => {
        await getOnlineFriends(data, socket, onlineUsers, io)
    })


    socket.on("JOIN_PRIVATE_CHAT", (data) => {
        socket.join(data);
    })

    socket.on("SEND_MESSAGE", (data)=> {
        socket.to(data.conversationId).emit("RECIEVE_MESSAGE", data)
    })

    // socket.on("callUser", ({ userToCall, signalData, from, name }) => {
	// 	io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	// });

	// socket.on("answerCall", (data) => {
	// 	io.to(data.to).emit("callAccepted", data.signal)
	// });


	console.log("SOCKET ID IS ", socket.id);


	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});

    // socket.on("CALL_USER", ({userToCall, signalData, callerDetails, callingType, recieverDetails})=> {
    //    io.to(userToCall).emit("CALL_USER", {signal: signalData, callerDetails, callingType, recieverDetails})
    // })

    // socket.on("ANSWER_CALL", (data)=> {
    //     console.log('====================================');
    //     console.log(data);
    //     console.log('====================================');
    //     io.to(data.to).emit("CALL_ACCEPTED", data.signal)
    //  })


    socket.on("disconnect", async()=> {
        const disconnectedUser = {key: Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id), value: socket.id };
        delete onlineUsers[disconnectedUser.key];
        socket.broadcast.emit("callEnded")
        await offlineStatusSendToFriends(disconnectedUser.key, socket, onlineUsers)
        console.log("User Disconnected", socket.id);
    })
})
