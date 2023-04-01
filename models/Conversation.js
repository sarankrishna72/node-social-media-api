const mongoose = require("mongoose")

const ConversationSchema = new mongoose.Schema({
    members: {
        type: Array,
        required: true,
    },
    description: {
        type: String,
        max: 500
    },
    conversationType: {
        type: String,
        default: 'private_chat'
    },
    groupIcon: {
        type: String,
        default: ""
    },
    isInfoOpen: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String,
        default: "#1877f2"
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Conversation", ConversationSchema)