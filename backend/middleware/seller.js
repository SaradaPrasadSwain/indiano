const jwt = require("jsonwebtoken");

const { sellerSecretKey } = require('../config')


function sellerMiddleware(req, res, next) {
    try {
        let token = req.cookies.token;
    
         if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1]; 
        }
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const decodedData = jwt.verify(token, sellerSecretKey);
        req.userId = decodedData.id;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token or session"})
    }
}

module.exports = {
    sellerMiddleware: sellerMiddleware
}