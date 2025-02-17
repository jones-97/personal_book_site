const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
	
    if (!token) return res.status(401).json({ message: "Access Denied, No Token" });
	
	
	
	
	
    try {
		console.log('Received token:', token);
		
        const verified = jwt.verify(token, process.env.JWT_SECRET);
		console.log('Decoded token:', jwt.verify(token, 'your-secret-key'));
        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
		console.log("The token be invalid my dear");
    }
};

module.exports = authMiddleware;
