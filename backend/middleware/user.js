const { userSecretKey } = require('../config')
const jwt = require("jsonwebtoken");

function userMiddleware(req, res, next) {   
    try {
        const token = req.cookies.token;
        const decodedData = jwt.verify(token, userSecretKey);
        req.userId = decodedData.id;
        next();
    } catch (error) {
        res.status(404).json({message: "please authenticate again"});
    }
}

module.exports = {
    userMiddleware: userMiddleware
}