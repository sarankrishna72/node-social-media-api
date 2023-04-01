const router = require("express").Router();
const Conversation = require("../models/Conversation")
const User = require("../models/User")
const Message = require("../models/Message")


// new Conversation
router.post("/", async(req,res) => {
    const newConversation =  new Conversation(
        {
            members: req.body.conversationType == 'group_chat' ? req.body.members : [ req.headers['x-auth-id'], req.body.receiverId],
            groupIcon: req.body.conversationType == 'group_chat' ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" : "",
            description:  req.body.description || ""
        }
    )

    try {
        const conversation = await newConversation.save()
        res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})

// update Conversation
router.patch("/:id", async(req,res) => {
    

    try {
        let conversation = await Conversation.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {
            returnDocument: 'after'
        })
        conversation = JSON.parse(JSON.stringify(conversation));
        const _id = conversation.members.find(x => x != req.headers['x-auth-id'])
        const lastMessage = await Message.find({conversationId: conversation._id}, ['createdAt','message']).sort({ _id: -1 }).limit(1)
        const chatUser = await User.findById({_id},['fName', 'lName', 'profilePicture'])
        conversation.reciepientUser = chatUser;
        conversation.lastMessage = lastMessage[0];

        res.status(200).json(conversation)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})


// get Conversations based on user
router.get("/", async(req,res) => {
    try {
        let conversations = await Conversation.find( { 
            members: { $in: [ req.headers['x-auth-id'] ] },
        });

        conversations = JSON.parse(JSON.stringify(conversations))

        for (const item of conversations) {
            const _id = item.members.find(x => x != req.headers['x-auth-id'])
            const lastMessage = await Message.find({conversationId: item._id}, ['createdAt','message', 'attachments']).sort({ _id: -1 }).limit(1)
            const chatUser = await User.findById({_id},['fName', 'lName', 'profilePicture'])
            item.reciepientUser = chatUser;
            item.lastMessage = lastMessage[0];
        }
        res.status(200).json(conversations)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})



module.exports = router;
