// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// Import database connection setup (NOW UNCOMMENTED)
const db = require('./config/db'); // Changed 'pool' to 'db' to match export

const app = express();

// --- Middleware ---

// Enable CORS for all origins (adjust for production later if needed)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

// Basic root route to check if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Monsters of Interest API!' });
});

// Placeholder for authentication routes
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// Placeholder for character routes
// const characterRoutes = require('./routes/characterRoutes');
// app.use('/api/characters', characterRoutes);

// Placeholder for preference routes
// const preferenceRoutes = require('./routes/preferenceRoutes');
// app.use('/api/preferences', preferenceRoutes);


// --- Error Handling Middleware (Optional but Recommended) ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// --- Server Startup ---

// Use the PORT environment variable provided by Heroku/local .env, default to 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Optional: Test database connection on startup (NOW UNCOMMENTED)
  // We use the exported query function from db.js
  db.query('SELECT NOW()', (err, res) => {
    if (err) {
      // Don't crash the app, just log the error
      console.error('!!! Error connecting to database:', err.message);
      console.error('!!! Ensure DATABASE_URL in .env is correct for local setup or Heroku Config Vars are set.');
    } else if (res && res.rows && res.rows.length > 0) {
      console.log('Database connected successfully at:', res.rows[0].now);
    } else {
        console.warn('Database query executed but returned no result for NOW(). Check connection.');
    }
  });
});

module.exports = app; // Export for potential testing