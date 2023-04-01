const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
// update user
router.put("/:id", async (req, res) => {
    if (req.headers['x-auth-id'] === req.params.id) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (error) {
                return res.status(500).json({
                    ...error,
                    ...{
                        message: "Something went wrong..."
                    }
                })
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, {
                returnDocument: 'after'
            })
            const {
                password,
                ...other
            } = user._doc;
            res.status(200).json({
                other,
                ...{
                    message: "Account has been updated ..."
                }
            })
        } catch (error) {
            return res.status(500).json({
                ...error,
                ...{
                    message: "Something went wrong!..."
                }
            })
        }
    } else {
        return res.status(403).json({
            message: "You can only update your account!..."
        })
    }
});

router.delete("/:id", async (req, res) => {
    if (req.headers['x-auth-id'] === req.params.id) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json({
                message: "Account has been deleted ..."
            })
        } catch (error) {
            return res.status(500).json({
                ...error,
                ...{
                    message: "Something went wrong!..."
                }
            })
        }
    } else {
        return res.status(403).json({
            message: "You can only delete your account!..."
        })
    }
})



router.get("/:username/friends", async (req, res) => {
    console.log('====================================');
    console.log(req.params.username);
    console.log('====================================');
    try {
        let user = await User.findOne({username: req.params.username})
        // if (!user) user = User.findOne({username: req.body.username})
        if (user) {
            const {
                password,
                followings,
                ...other
            } = user;
    
            let userFollowings =  await User.find({},['fName', 'lName', 'profilePicture']).where('_id').in(followings).exec()
    
            return res.status(200).json(userFollowings)
        } 

        return res.status(400).json({message: 'User not found!...'})
       
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

router.post("/follow", async (req, res) => {
    if (req.headers['x-auth-id'] != req.body.userId) {
        try {
            const followUser = await User.findById(req.body.userId);
            const currentUser = await User.findById(req.headers['x-auth-id']);
            if (!currentUser.followings.includes(req.body.userId)) {
                await currentUser.updateOne({
                    $push: {
                        followings: req.body.userId
                    }
                })
                await followUser.updateOne({
                    $push: {
                        followers: req.headers['x-auth-id']
                    }
                })
                return res.status(200).json({
                    message: "User has been followed..."
                })
            } else {
                return res.status(403).json({
                    message: "You are already following this user!..."
                })
            }


        } catch (error) {
            return res.status(500).json({
                ...error,
                ...{
                    message: "Something went wrong!..."
                }
            })
        }
    } else {
        return res.status(403).json({
            message: "You can't follow yourself!..."
        })
    }
})

router.post("/unfollow", async (req, res) => {
    if (req.headers['x-auth-id'] != req.body.userId) {
        try {
            const followUser = await User.findById(req.body.userId);
            const currentUser = await User.findById(req.headers['x-auth-id']);
            if (currentUser.followings.includes(req.body.userId)) {
                await currentUser.updateOne({
                    $pull: {
                        followings: req.body.userId
                    }
                })
                await followUser.updateOne({
                    $pull: {
                        followers: req.headers['x-auth-id']
                    }
                })
                return res.status(200).json({
                    message: "User has been unfollowed..."
                })
            } else {
                return res.status(403).json({
                    message: "You are not following this user!..."
                })
            }


        } catch (error) {
            return res.status(500).json({
                ...error,
                ...{
                    message: "Something went wrong!..."
                }
            })
        }
    } else {
        return res.status(403).json({
            message: "You can't follow yourself!..."
        })
    }
})

router.get("/:id", async (req, res) => {

    try {
        let user = await User.findById(req.params.id)
        if (!user) user = User.findOne({username: req.body.username})
        const {
            password,
            ...other
        } = user._doc;
        return res.status(200).json(other)
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
