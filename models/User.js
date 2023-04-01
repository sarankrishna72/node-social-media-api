const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 3,
        max: 20,
        unique: true
    },
    authenticationToken: {
        type: String,
        require: true,
        min: 3,
        max: 60,
        unique: true
    },
    fName: {
        type: String,
        require: true,
        min: 3,
        max: 20,
    },
    lName: {
        type: String,
        max: 20,
    },
    email: {
        type: String,
        require: true,
        max: 50,
        unique: true
    },
    phoneNumber: {
        type: String,
        max: 20,
    },
    password: {
        type: String,
        require: true,
        min: 6
    },
    profilePicture: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },
    coverPicture: {
        type: String,
        default: "https://scontent.fcok1-1.fna.fbcdn.net/v/t1.6435-9/94600928_106559107708898_5860687444684308480_n.png?_nc_cat=100&ccb=1-7&_nc_sid=e3f864&_nc_ohc=VuJHPBx44nIAX_QMSSO&_nc_ht=scontent.fcok1-1.fna&oh=00_AT_Tb4N2GJlFhq1fG0Pv44sA8TtDUhSeCGIYmT8PAfJfpg&oe=634E4830"
    },

    description: {
        type: String,
        max: 100
    },
    city: {
        type: String,
        max: 25
    },
    from: {
        type: String,
        max: 50
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3]
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
    },{
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

userSchema.virtual('name').get(function() {
    return `${this.fName} ${this.lName}`;
})

module.exports = mongoose.model("User", userSchema)
