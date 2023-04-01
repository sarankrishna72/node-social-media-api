const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        max: 500
    },
    attachments: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Post", postSchema)