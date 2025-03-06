const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
    // Get token from headers
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // Set user details in request object
        next(); // Continue to the next middleware or route
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
