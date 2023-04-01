const router = require("express").Router();
const upload = require("../libs/upload")
const Message = require("../models/Message");



// new Message
router.post("/",upload.array('attachments'), async(req,res) => {
    
    if (req.files?.length > 0) {
        const files = [];
        for (const item of req.files) {
            const data = {
                mimetype: item.mimetype,
                path: `http://${req.headers.host}/${item.path}`,
                size: item.size
            }
            files.push(data)
        }
    
        req.body['attachments'] = files
    }
    
    const newMessage =  new Message({...req.body, ...{sender: req.headers['x-auth-id']}})

    try {
        let saveMessage = await newMessage.save()
        await newMessage.populate('sender', 'fName lName name profilePicture')
        saveMessage = JSON.parse(JSON.stringify(saveMessage))
        saveMessage.isOwnMessage = true
        res.status(200).json(saveMessage)
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})


// get Message
router.get("/conversation/:conversationId", async(req,res) => {
    try {
        let messages =  await Message.where({
            conversationId: req.params.conversationId
        }).populate('sender', 'fName lName name profilePicture').exec()
        messages = JSON.parse(JSON.stringify(messages))
        for (const message of messages) {
            message.isOwnMessage = false
            if (message.sender._id == req.headers['x-auth-id']) message.isOwnMessage = true
        }
        res.status(200).json(messages)
    } catch (error) {
        
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})

module.exports = router;
