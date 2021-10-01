const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");
const Task = require("./task");

//User model definition

//by creating and passing a schema to the user model, other methods can be attached to it later

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true, //put this so that only unique emails can be stored and remember to drop the collection if this line was added after the collection was created.
            required: true,
            trim: true,
            lowercase: true,
            async validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid Email");
                }
                /* const emailExist = await User.findOne({ value });
            if (emailExist) {
                throw new Error("Email already exists");
            } */
            },
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("Age must be a positive number");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 7,
            validate(value) {
                if (value.includes("password")) {
                    throw new Error(`Your password cannot contain "password"`);
                }
            },
        },
        tokens: [
            //it is an array so that a user can have multiple tokens created
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);

//since the User model doesnt contain a tasks field, we need to create a virtual property between the users and their tasks
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});

//using userSchema.methods means a function is being attached to each instance of the model. So to individual users not the User model

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    //dont show the password and tokens fields
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    //the sign method on jwt expects 2 parameters, a unique identifying as an object e.g. user id in the form of a string, and the secret word in the form of a string.
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.TOKEN_SECRET
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

//using userSchema.statics adds the function to the User itself as in to the model name
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    //console.log(user);
    console.log("value of isMatch: ", isMatch);
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    return user;
};

/* there are 2 methods on the schema that can be attached. "pre" meaning we want action to happen
before for example the save process, and "post" meaning we want an action to happen after the save process. The function it accepts as the second argument needs to be a regular function since arrow functions do not bind the keyword "this"*/

//hash the plain text password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    //remember that certain mongoose function like update bypass the middleware we created

    next(); //call the next function so that the mongoose function can run after our function runs
});

//delete all tasks associated with the user when the user is deleted
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model("User", userSchema);

/* const user = new User({
    name: "Audrey Lotsu",
    email: "audrey-lotsu@gmail.com",
    age: 43,
    password: "p@ssw0rd789",
});

user.save()
    .then(() => {
        console.log(user);
    })
    .catch((error) => {
        console.log("Error", error);
    }); */
User.createIndexes(); //so that only unique emails are created
module.exports = User;
