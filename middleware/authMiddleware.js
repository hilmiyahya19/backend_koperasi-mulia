const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET; // Ganti dengan secret key yang lebih aman

// Middleware untuk memeriksa JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded; // Simpan data user ke dalam req.user
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};

// Middleware untuk memeriksa role tertentu
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied, insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticateJWT, authorizeRole };



