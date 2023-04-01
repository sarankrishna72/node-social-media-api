const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const upload = require("../libs/upload")
const os = require("os");
// Create a Post
router.post("/", upload.array('attachments'), async (req, res) => {    
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
   
    const newPost = new Post({
        ...req.body,
        ...{
            user: req.headers['x-auth-id']
        }
    });
    try {
        const post = await (await newPost.save()).populate('user', ['fName', 'lName','name', 'profilePicture', 'username']);
        res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})

// Update a Post
router.put("/:id", async (req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.headers['x-auth-id']) {
            const {
                userId,
                ...body
            } = req.body;
            const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
                $set: body
            }, {
                returnDocument: 'after'
            })
            res.status(200).json({
                ...{ post: updatedPost},
                ...{
                    message: "The post has been updated..."
                }
            })
        } else {
            return res.status(401).json({
                message: "You can't update others post!..."
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
})

// get Timeline Posts
router.get("/timeline/:username", async (req, res) => {
    try {
        const user = await User.findOne( {username: req.params.username});
        const userPosts = await Post.find( {user: user._id} ).populate('user', ['fName', 'lName','name', 'profilePicture', 'username'])       
        const friendsPosts = await Post.where({'user': user.followings}).populate('user', ['fName', 'lName','name', 'profilePicture', 'username']);
        let totalPosts =  JSON.parse(JSON.stringify(userPosts.concat(...friendsPosts)))
        for (let index = 0; index < totalPosts.length; index++) {
            totalPosts[index]['isUserLiked'] = false;
            if ( totalPosts[index].likes.includes(JSON.parse(JSON.stringify(user)).id)) {
                totalPosts[index]['isUserLiked']  = true;
            }             
        }
        res.status(200).json(totalPosts)
    } catch(error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
});


// Get a Post
router.get("/:id", async (req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }

})


// Delete a Post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (req.headers['x-auth-id'] === post.userId) {
            try {
                await Post.findByIdAndDelete(req.params.id)
                res.status(200).json({
                    message: "The post has been deleted ..."
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
                message: "You can only delete your post!..."
            })
        }
    } catch(error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }

})

// Like/Dislike a Post
router.post("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.headers['x-auth-id'])) {
            await post.updateOne({ $push: { likes: req.headers['x-auth-id']} });
            res.status(200).json({message: "The post has been liked"})
        } else {
            await post.updateOne({ $pull: { likes: req.headers['x-auth-id']} });
            res.status(200).json({message: "The post has been disliked"})
        }
    } catch(error) {
        return res.status(500).json({
            ...error,
            ...{
                message: "Something went wrong!..."
            }
        })
    }
})



module.exports = router;
