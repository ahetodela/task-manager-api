const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        //grab the token which was sent through postman and remove the beginning leaving only the jwt
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        //grab the user who created that token using the id stored on the token and also check from the token array from the token field is the token being used is still valid
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });

        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user; //if the user exists, pass the user to the req so that the route handlers can have access to the user instead of having to fetch the user again which is redundant
        next();
    } catch (error) {
        res.status(401).send({ error: "Please Authenticate yourself 🙄" });
    }
};

module.exports = auth;
