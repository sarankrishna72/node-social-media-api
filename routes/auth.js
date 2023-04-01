const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { authTokenGenerate } =  require("../libs/commonLib");


// const  authTokenGenerate = (length) => {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//    }
//    return result;
// }

router.post("/register", async (req, res) => {
    try {
        // encrypt password
       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        req.body['password'] = hashedPassword;
        req.body['username'] = `${req.body?.fName}.${req.body?.lName}.${(new Date()).getTime().toString(36)}`.split(' ').join('');
        req.body['authenticationToken'] = authTokenGenerate(60)
        
        const user = await new User(req.body)
        console.log( user);
        await user.save();
        const {
            password,
            ...other
        } = user._doc;
        // response and data
        res.status(200).json(other);
    } catch(error) {
        console.log(error);
        message = 'invalid request';
        if (error.code == 11000) {
            message = `User with ${error.keyValue[Object.keys(error.keyPattern)[0]]} is already exists`
        }
        res.status(400).json({message: message});
    }


})

router.post("/signIn", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        !user && res.status(404).json({message: "No user found..."})
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json({message: "Wrong Password..."})
        const {password, ...jsonObj} = user._doc


        res.status(200).json(jsonObj)
    } catch(error) {
        res.status(500).json({...error, ...{message: "Something went wrong..."}})
    }

})



module.exports = router;
