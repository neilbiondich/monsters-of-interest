const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer TOKEN)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (split 'Bearer TOKEN' and take the second part)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user info (payload) to the request object
            // We need to make sure the payload contains the userId when we create the token
            // In authController.js, the payload is { userId: user.id, email: user.email, accountTier: user.account_tier }
            // So, decoded will contain these fields.
            req.user = decoded; // Attaching the decoded payload

            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            console.error('Token verification failed:', error.message);
            // Handle specific errors like expired token
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
             // Handle other verification errors
            return res.status(401).json({ message: 'Not authorized, token failed verification' });
        }
    }

    // If no token is found in the header
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Optional: Middleware to check for specific roles/tiers (for future use)
// const authorize = (...tiers) => {
//     return (req, res, next) => {
//         if (!req.user || !tiers.includes(req.user.accountTier)) {
//             return res.status(403).json({ message: `User tier ${req.user?.accountTier} is not authorized to access this route` }); // Forbidden
//         }
//         next();
//     };
// };


module.exports = { protect }; // Export the protect middleware
// module.exports = { protect, authorize }; // If using authorize later