const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {
    sendWelcomeEmail,
    sendCancellationEmail,
} = require("../emails/account");

//create a user
router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
    /* user.save()
        .then((user) => res.status(201).send(user))
        .catch((error) => res.status(400).send(error)); */
});
//login users
router.post("/users/login", async (req, res) => {
    //console.log(req.body);

    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).json(error);
    }
});
//logout out from one session
router.post("/users/logout", auth, async (req, res) => {
    try {
        //check from the tokens saved in the database if the token being used to login is in the db.
        //if it is, remove that token and save the user afterwards
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

//logout from all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []; //wipe all the tokens associated with this user
        await req.user.save();

        res.send("Logout successful");
    } catch (error) {
        res.status(500).send(error);
    }
});

//get all users
router.get("/users/me", auth, async (req, res) => {
    //since the auth will check if the user is correctly authenticated or not we can just send back the user object
    res.send(req.user);
    /* User.find({})
        .then((users) => {
            res.send(users);
        })
        .catch((e) => {
            res.status(500).send();
        }); */
});

//update user
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body); //transforming the properties of the body into an array eg updates=["name","email"];

    try {
        //const user = await User.findById(id); //this returns the actual document which was found if any.

        /* const user = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }); */ //since a middleware has been supplied to the user schema in the user model, the findByIdAndUpdate will bypass the save method from the user schema so this function needs to change to save()
        /* if (!user) {
            return res.status(404).send("User not found");
        } */
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});
//delete a user
router.delete("/users/me", auth, async (req, res) => {
    try {
        /* const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).send("User Not Found");
        } */
        const { email, name } = req.user;
        await req.user.remove();
        sendCancellationEmail(email, name);
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});
//uploading user profile picture
const upload = multer({
    //dest: "avatars",//for the router to have access to the file in the req, delete this
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)/)) {
            return cb(new Error("Please upload a .jpeg, .jpg, or .png file "));
        }

        cb(undefined, true);
    },
});
//router to send file to db
router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

//delete profile pic
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

//view profile pic
router.get("/users/:id/avatar", async (req, res) => {
    /* if (!req.user.avatar) {
        return res.status(404).send("avatar not found");
    }
    res.set("Content-Type", "image/jpg"); //setting response headers
    res.send(req.user.avatar); */
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});

module.exports = router;
