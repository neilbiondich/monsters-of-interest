// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// Import database connection setup
const db = require('./config/db');

// --- Import Route Files ---
const authRoutes = require('./routes/authRoutes'); // NOW UNCOMMENTED/ADDED
// const characterRoutes = require('./routes/characterRoutes'); // Placeholder
// const preferenceRoutes = require('./routes/preferenceRoutes'); // Placeholder

const app = express();

// --- Middleware ---

// Enable CORS for all origins (adjust for production later if needed)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// --- Mount Routers ---

// Basic root route to check if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Monsters of Interest API!' });
});

// Mount authentication routes under the /api/auth prefix
app.use('/api/auth', authRoutes); // NOW UNCOMMENTED/ADDED

// Mount character routes (placeholder)
// app.use('/api/characters', characterRoutes);

// Mount preference routes (placeholder)
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
  // Optional: Test database connection on startup
  db.query('SELECT NOW()', (err, res) => {
    if (err) {
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