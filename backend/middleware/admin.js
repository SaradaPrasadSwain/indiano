const jwt = require('jsonwebtoken');
const { adminSecretKey } = require('../config');
    

function adminMiddleware(req, res, next) {
    try {
        let token = req.cookies.token;
    
        const decodedData = jwt.verify(token, adminSecretKey);
        req.userId = decodedData.id;
        next();
    } catch (error) {
        res.status(403).status({ message: "Invalid token or session"})
    }
}

module.exports = {
    adminMiddleware: adminMiddleware
}