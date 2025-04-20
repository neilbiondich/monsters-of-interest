const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Import the database query function

// --- Registration ---
exports.registerUser = async (req, res) => {
    const { email, password, displayName } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (password.length < 6) { // Example: Enforce minimum password length
         return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        // 1. Check if user already exists
        const userCheck = await db.query('SELECT email FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' }); // 409 Conflict
        }

        // 2. Hash the password
        const saltRounds = 10; // Standard practice for bcrypt
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insert the new user into the database
        const newUserQuery = `
            INSERT INTO users (email, password_hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, display_name, account_tier, created_at
        `;
        const newUserResult = await db.query(newUserQuery, [email, passwordHash, displayName]);
        const newUser = newUserResult.rows[0];

        // 4. Respond with success (don't usually log in automatically on register)
        console.log(`User registered: ${newUser.email} (ID: ${newUser.id})`);
        res.status(201).json({ // 201 Created
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.display_name,
                accountTier: newUser.account_tier,
                createdAt: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

// --- Login ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Find the user by email
        const userQuery = 'SELECT id, email, password_hash, display_name, account_tier FROM users WHERE email = $1';
        const userResult = await db.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Unauthorized
        }
        const user = userResult.rows[0];

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Unauthorized
        }

        // 3. Passwords match - Generate JWT
        const payload = {
            userId: user.id,
            email: user.email,
            accountTier: user.account_tier
            // Add other non-sensitive info if needed
        };

        // Use the secret from environment variables
        const secret = process.env.JWT_SECRET;
        if (!secret) {
             console.error('JWT_SECRET is not defined in environment variables!');
             return res.status(500).json({ message: 'Internal server error: JWT configuration missing.' });
        }

        const options = {
            expiresIn: '1d' // Token expires in 1 day (adjust as needed)
        };

        const token = jwt.sign(payload, secret, options);

        // 4. Respond with success and the token
        console.log(`User logged in: ${user.email} (ID: ${user.id})`);
        res.status(200).json({
            message: 'Login successful.',
            token: token,
            user: { // Send back some user info for the frontend
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                accountTier: user.account_tier
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// --- Get Current User (Example for later) ---
// exports.getCurrentUser = async (req, res) => {
//     // This function assumes middleware has verified the token
//     // and attached user info (e.g., userId) to req.user
//     try {
//         const userId = req.user.userId; // Get user ID from token payload (added by middleware)
//         const userQuery = 'SELECT id, email, display_name, account_tier FROM users WHERE id = $1';
//         const userResult = await db.query(userQuery, [userId]);

//         if (userResult.rows.length === 0) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         res.status(200).json(userResult.rows[0]);
//     } catch (error) {
//         console.error('Get Current User Error:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };