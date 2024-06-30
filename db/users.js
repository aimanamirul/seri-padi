import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import Booking from './bookings.js'
import bcrypt from 'bcrypt';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const router = express.Router();
router.use(express.json());

// Serve static files from the public directory
router.use(express.static(path.join(__dirname, 'public')));

const database = new Database(config);
const DB_TABLE = 'SP_USERS';
const DB_TABLE_PK = 'ID_USER';

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(data.Password, salt);

    data.Password = hashedPassword;
    data.Role = "USER";

    const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const tableID = req.params.id;
    if (tableID) {
      const result = await database.read(DB_TABLE, DB_TABLE_PK, tableID);
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tableId = req.params.id;
    const table = req.body;

    if (tableId && table) {
      delete table.id;
      const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404).json({ error: 'User ID and data are required' });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tableId = req.params.id;

    if (!tableId) {
      res.status(404).json({ error: 'User ID is required' });
    } else {
      const rowsAffected = await database.delete(DB_TABLE, DB_TABLE_PK, tableId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await database.authenticateUser(username, password);
    if (user) {
      req.session.user = user;
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// router.get('/bookings_page', async (req, res) => {
//   try {
//     if (!req.session.user) {
//       // return res.status(401).json({ error: 'Unauthorized' });
//       const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
//       res.sendFile(htmlPath);
//     } else {
//       // Adjust path to bookings.html relative to your project structure

//       const bookings = await fetchBookingsForUser(req.session.user.ID_USER);

//       // console.log(bookings);
//       res.render('bookings');

//       // const htmlPath = path.resolve(__dirname, 'public', 'bookings.html');
//       // res.sendFile(htmlPath);
//     }
//   } catch (err) {

//   }
//   // res.sendFile(path.join(__dirname, 'public', 'bookings.html'));
// });

router.get('/bookings_page', async (req, res) => {
  try {
    if (!req.session.user) {
      // If user is not logged in, return a page indicating login is required
      const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
      return res.sendFile(htmlPath);
    } else {
      // User is logged in, fetch bookings for the user
      const userId = req.session.user.ID_USER;
      const bookings = await fetchBookingsForUser(userId);
      console.log('Bookings:', bookings);

      // Render the bookings.ejs file with the bookings data
      res.render('bookings', { bookings });
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

async function fetchBookingsForUser(userId) {
  try {
    // Query the database for bookings associated with the user
    const result = await database.readMany("SP_BOOKINGS", "ID_USER", userId);
    return result; // Return the fetched bookings data
  } catch (err) {
    throw new Error(`Failed to fetch bookings: ${err.message}`);
  }
}

// async function fetchBookingsForUser(userId) {
//   try {
//     // Get the table with the specified ID
//     const tableID = req.params.id;
//     console.log(`tableId: ${tableID}`);
//     if (tableID) {
//       const result = await database.read("SP_BOOKINGS", "ID_USER", userId);
//       console.log(`tables: ${JSON.stringify(result)}`);
//       return result;
//       // res.status(200).json(result);
//     } else {
//       res.status(404);
//     }
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// }

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

router.get('/', async (_, res) => {
  try {
    const users = await database.readAll(DB_TABLE);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
