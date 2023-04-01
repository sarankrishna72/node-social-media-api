const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    attachments: {
        type: Array,
        default: []
    },
    message: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Message", MessageSchema)