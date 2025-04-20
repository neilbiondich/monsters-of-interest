const { Pool } = require('pg');

// The pg Pool constructor automatically uses environment variables
// for connection details if they exist (like DATABASE_URL from Heroku/dotenv).
// You can also configure it explicitly if needed, but relying on
// DATABASE_URL is standard practice, especially for Heroku.

const pool = new Pool({
  // Heroku provides the DATABASE_URL environment variable
  // which includes SSL configuration when necessary.
  // Locally, it reads from your .env file.
  connectionString: process.env.DATABASE_URL,
  // Add SSL configuration for Heroku connection, but allow non-SSL locally
  // Heroku requires SSL, local development usually doesn't
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Optional: Test connection on module load (can be noisy)
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Error connecting to database pool:', err);
//   } else {
//     console.log('Database pool connected successfully.');
//   }
// });

module.exports = {
  // Export a query function that uses the pool
  query: (text, params) => pool.query(text, params),
  // Export the pool itself if direct access is needed (less common)
  // pool: pool
};