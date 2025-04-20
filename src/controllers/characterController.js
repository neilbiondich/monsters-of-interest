const db = require('../config/db'); // Import the database query function

// --- Helper function to get user ID from request (added by authMiddleware) ---
const getUserId = (req) => {
    if (!req.user || !req.user.userId) {
        throw new Error('User ID not found on request. Middleware issue?');
    }
    return req.user.userId;
};

// --- Create Character (Manual) ---
exports.createCharacter = async (req, res) => {
    const userId = getUserId(req);
    // Destructure expected fields from request body, providing defaults
    const {
        character_name,
        origin = null, // e.g., Species
        faction = null,
        mind = 1, // Example starting values
        body = 1,
        spirit = 1,
        fortune = 1,
        story_points_total = 100, // Default starting SP
        professions = '[]', // Default empty JSON array string
        spells = '[]',
        inventory = '[]',
        notes = null
    } = req.body;

    // Basic validation
    if (!character_name) {
        return res.status(400).json({ message: 'Character name is required.' });
    }

    // Ensure JSON fields are valid strings if provided, otherwise use default
    const professionsJson = typeof professions === 'string' ? professions : JSON.stringify(professions || []);
    const spellsJson = typeof spells === 'string' ? spells : JSON.stringify(spells || []);
    const inventoryJson = typeof inventory === 'string' ? inventory : JSON.stringify(inventory || []);


    const query = `
        INSERT INTO characters
            (user_id, character_name, origin, faction, mind, body, spirit, fortune, story_points_total, professions, spells, inventory, notes)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *; -- Return the newly created character row
    `;
    const values = [
        userId, character_name, origin, faction, mind, body, spirit, fortune, story_points_total, professionsJson, spellsJson, inventoryJson, notes
    ];

    try {
        const result = await db.query(query, values);
        console.log(`Character created: ${result.rows[0].character_name} (ID: ${result.rows[0].id}) for User ID: ${userId}`);
        res.status(201).json(result.rows[0]); // Respond with the created character data
    } catch (error) {
        console.error('Create Character Error:', error);
        // Specific check for JSON parsing errors if needed
         if (error.message.includes("invalid input syntax for type json")) {
             return res.status(400).json({ message: 'Invalid JSON format provided for professions, spells, or inventory.' });
         }
        res.status(500).json({ message: 'Internal server error during character creation.' });
    }
};

// --- Auto-Build Character (Placeholder) ---
exports.autoBuildCharacter = async (req, res) => {
    const userId = getUserId(req);
    const { species, profession, faction } = req.body; // Optional inputs

    console.log(`Auto-building character for User ID: ${userId} with preferences:`, { species, profession, faction });

    // --- TODO: Implement Auto-Build Logic ---
    // 1. Define lists/rules for random selection (Species, Factions, Professions)
    // 2. Select options (use provided ones or randomize if missing)
    // 3. Generate a name (e.g., using simple rules or a library)
    // 4. Apply species bonuses to traits
    // 5. Allocate starting traits/fortune based on rules
    // 6. Select starting profession (use provided or randomize) & deduct SP cost
    // 7. Spend remaining SP based on profession (e.g., prioritize core trainings, add basic spells/items)
    // 8. Format data (professions, spells, inventory) as JSON strings

    // --- Placeholder Implementation ---
    const randomName = `AutoChar_${Date.now().toString().slice(-6)}`;
    const randomOrigin = species || ['Human', 'Goblin', 'Orc', 'Fae'][Math.floor(Math.random() * 4)];
    const randomFaction = faction || ['Unaligned', 'Guild', 'Crown', 'Cult'][Math.floor(Math.random() * 4)];
    const randomProfession = profession || ['Alchemist', 'Knight Errant', 'Lucky Rogue'][Math.floor(Math.random() * 3)];

    const placeholderCharacter = {
        character_name: randomName,
        origin: randomOrigin,
        faction: randomFaction,
        mind: Math.floor(Math.random() * 3) + 1,
        body: Math.floor(Math.random() * 3) + 1,
        spirit: Math.floor(Math.random() * 3) + 1,
        fortune: Math.floor(Math.random() * 2) + 1,
        story_points_total: 100,
        story_points_spent: 10, // Placeholder cost for profession
        professions: JSON.stringify([{ name: randomProfession, trainings: [] }]),
        spells: '[]',
        inventory: '[]',
        notes: 'Automatically generated character.'
    };
    // --- End Placeholder ---


    const query = `
        INSERT INTO characters
            (user_id, character_name, origin, faction, mind, body, spirit, fortune, story_points_total, story_points_spent, professions, spells, inventory, notes)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
    `;
    const values = [
        userId,
        placeholderCharacter.character_name,
        placeholderCharacter.origin,
        placeholderCharacter.faction,
        placeholderCharacter.mind,
        placeholderCharacter.body,
        placeholderCharacter.spirit,
        placeholderCharacter.fortune,
        placeholderCharacter.story_points_total,
        placeholderCharacter.story_points_spent,
        placeholderCharacter.professions,
        placeholderCharacter.spells,
        placeholderCharacter.inventory,
        placeholderCharacter.notes
    ];

    try {
        const result = await db.query(query, values);
        console.log(`Character auto-built: ${result.rows[0].character_name} (ID: ${result.rows[0].id}) for User ID: ${userId}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Auto-Build Character Error:', error);
        res.status(500).json({ message: 'Internal server error during auto-build.' });
    }
};


// --- Get User's Characters ---
exports.getUserCharacters = async (req, res) => {
    const userId = getUserId(req);
    const query = 'SELECT * FROM characters WHERE user_id = $1 ORDER BY updated_at DESC';

    try {
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows); // Return array of characters
    } catch (error) {
        console.error('Get User Characters Error:', error);
        res.status(500).json({ message: 'Internal server error fetching characters.' });
    }
};

// --- Get Single Character by ID ---
exports.getCharacterById = async (req, res) => {
    const userId = getUserId(req);
    const characterId = req.params.id;

    // Validate characterId is potentially a number
    if (isNaN(parseInt(characterId))) {
         return res.status(400).json({ message: 'Invalid character ID format.' });
    }

    const query = 'SELECT * FROM characters WHERE id = $1 AND user_id = $2';

    try {
        const result = await db.query(query, [characterId, userId]);

        if (result.rows.length === 0) {
            // Character not found OR doesn't belong to this user
            return res.status(404).json({ message: 'Character not found.' });
        }

        res.status(200).json(result.rows[0]); // Return the character data
    } catch (error) {
        console.error('Get Character By ID Error:', error);
        res.status(500).json({ message: 'Internal server error fetching character.' });
    }
};

// --- Update Character ---
exports.updateCharacter = async (req, res) => {
    const userId = getUserId(req);
    const characterId = req.params.id;
    const updates = req.body;

    // Validate characterId
    if (isNaN(parseInt(characterId))) {
         return res.status(400).json({ message: 'Invalid character ID format.' });
    }

    // Prevent updating user_id or id
    delete updates.user_id;
    delete updates.id;
    delete updates.created_at; // Don't allow updating creation time
    updates.updated_at = new Date(); // Manually set update time (trigger should also work)

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    // Construct the SET part of the query dynamically
    // Start index at 3 because $1=characterId, $2=userId
    const setClause = fields.map((field, index) => `"${field}" = $${index + 3}`).join(', ');

    const query = `
        UPDATE characters
        SET ${setClause}
        WHERE id = $1 AND user_id = $2
        RETURNING *; -- Return the updated character
    `;

    try {
        // Ensure JSON fields are stringified if they are objects/arrays
        const processedValues = values.map(value => {
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
            }
            return value;
        });

        const result = await db.query(query, [characterId, userId, ...processedValues]);

        if (result.rows.length === 0) {
            // Character not found OR doesn't belong to this user
            return res.status(404).json({ message: 'Character not found or update failed.' });
        }
        console.log(`Character updated: ID ${characterId} for User ID: ${userId}`);
        res.status(200).json(result.rows[0]); // Return the updated character data

    } catch (error) {
        console.error('Update Character Error:', error);
         if (error.message.includes("invalid input syntax for type json")) {
             return res.status(400).json({ message: 'Invalid JSON format provided for professions, spells, or inventory.' });
         }
        res.status(500).json({ message: 'Internal server error updating character.' });
    }
};

// --- Delete Character ---
exports.deleteCharacter = async (req, res) => {
    const userId = getUserId(req);
    const characterId = req.params.id;

    // Validate characterId
    if (isNaN(parseInt(characterId))) {
         return res.status(400).json({ message: 'Invalid character ID format.' });
    }

    const query = 'DELETE FROM characters WHERE id = $1 AND user_id = $2';

    try {
        const result = await db.query(query, [characterId, userId]);

        if (result.rowCount === 0) {
            // Character not found OR doesn't belong to this user
            return res.status(404).json({ message: 'Character not found or deletion failed.' });
        }
        console.log(`Character deleted: ID ${characterId} for User ID: ${userId}`);
        res.status(204).send(); // 204 No Content is standard for successful DELETE

    } catch (error) {
        console.error('Delete Character Error:', error);
        res.status(500).json({ message: 'Internal server error deleting character.' });
    }
};