import express from 'express';
import { config } from './config.js';
import Database from './database.js';

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
// console.log(config);

// Create database object
const database = new Database(config);
const DB_TABLE = 'SP_BOOKINGS'
const DB_TABLE_PK = 'ID_BOOKING'

router.get('/', async (_, res) => {
  try {
    // Return a list of users
    const users = await database.readAll(DB_TABLE);
    console.log(`users: ${JSON.stringify(users)}`);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Create a table
    const data = req.body;
    console.log(`data: ${JSON.stringify(data)}`);
    const rowsAffected = await database.create(DB_TABLE, data);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Get the table with the specified ID
    const tableID = req.params.id;
    console.log(`tableId: ${tableID}`);
    if (tableID) {
      const result = await database.read(DB_TABLE, DB_TABLE_PK, tableID);
      console.log(`tables: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update the table with the specified ID
    const tableId = req.params.id;
    console.log(`tableId: ${tableId}`);
    const table = req.body;

    if (tableId && table) {
      delete table.id;
      console.log(`table: ${JSON.stringify(table)}`);
      const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete the table with the specified ID
    const tableId = req.params.id;
    console.log(`tableId: ${tableId}`);

    if (!tableId) {
      res.status(404);
    } else {
      const rowsAffected = await database.delete(DB_TABLE, DB_TABLE_PK, tableId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;