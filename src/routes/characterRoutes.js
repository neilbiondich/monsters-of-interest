const express = require('express');
// Import the authentication middleware
const { protect } = require('../middleware/authMiddleware');
// Import the character controller (we will create this next)
const characterController = require('../controllers/characterController');

const router = express.Router();

// Apply the 'protect' middleware to all routes defined after this point in this file
// Any request to /api/characters/* must have a valid JWT token
router.use(protect);

// --- Define Character Routes ---

// POST /api/characters/autobuild - Create a character automatically
router.post('/autobuild', characterController.autoBuildCharacter);

// POST /api/characters - Create a character manually
router.post('/', characterController.createCharacter);

// GET /api/characters - Get all characters for the logged-in user
router.get('/', characterController.getUserCharacters);

// GET /api/characters/:id - Get a specific character by its ID
router.get('/:id', characterController.getCharacterById);

// PUT /api/characters/:id - Update a specific character by its ID
router.put('/:id', characterController.updateCharacter);

// DELETE /api/characters/:id - Delete a specific character by its ID
router.delete('/:id', characterController.deleteCharacter);


module.exports = router;