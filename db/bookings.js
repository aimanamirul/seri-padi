import express from 'express';
import { config } from './config.js';
import Database from './database.js';
import { sendEmail } from '../util/emailer.js';

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);
const DB_TABLE = 'SP_BOOKINGS'
const DB_TABLE_PK = 'ID_BOOKING'

router.get('/', async (_, res) => {
  try {
    // Return a list of bookings
    const bookings = await database.readAll(DB_TABLE);
    // console.log(`bookings: ${JSON.stringify(bookings)}`);

    const dateObj = new Date(bookings.BOOKING_DATE);
    const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
    const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
    bookings.BOOKING_DATE = `${formattedDate} ${formattedTime}`;

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

function padZero(num) {
  return num.toString().padStart(2, '0');
}

router.post('/create', async (req, res) => {
  try {
    // Create a table
    const data = req.body;
    console.log(`data: ${JSON.stringify(data)}`);
    const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
    if (rowsAffected) {

      emailerAction("bookingSent", data);

      // const dateObj = new Date(data.BOOKING_DATE);
      // const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
      // const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;

      // const readableDate = `${formattedDate} ${formattedTime}`;

      // const subject = 'Booking Submitted';
      // const text = `Dear ${data.BOOKING_NAME}, we have received your booking for ${readableDate}.`;
      // const html = `<p>Dear ${data.BOOKING_NAME},</p>
      // <p>We have received your for ${readableDate}.</p>
      // <p><strong>Booking Tracking Number:</strong> ${data.ID_BOOKING}  </p>
      // <p><strong>Name:</strong> ${data.BOOKING_NAME}  </p>
      // <p><strong>Phone Number:</strong> ${data.BOOKING_TEL}  </p>
      // <p><strong>Persons:</strong> ${data.BOOKING_PAX} pax </p>
      // <p><strong>Remarks:</strong> ${data.BOOKING_REMARKS}  </p>

      // <p>A confirmation e-mail will be sent to you upon confirmation of the booking, thank you.</p>
      // <p><strong>Seri Padi De Cabin Management</strong></p>
      // `;

      // await sendEmail(data.BOOKING_EMAIL, subject, text, html);

      res.status(201).json({ rowsAffected });
    } else {
      res.status(500).json({ error: 'Failed to create booking.' });
    }

  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

async function emailerAction(templateType, data) {
  try {
    switch (templateType) {
      case "bookingSent":
        const dateObj = new Date(data.BOOKING_DATE);
        const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
        const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;

        const readableDate = `${formattedDate} ${formattedTime}`;
        const subject = 'Booking Submitted';
        const text = `Dear ${data.BOOKING_NAME}, we have received your booking for ${readableDate}.`;
        const html = `<p>Dear ${data.BOOKING_NAME},</p>
      <p>We have received your for ${readableDate}.</p>
      <p><strong>Booking Tracking Number:</strong> ${data.ID_BOOKING}  </p>
      <p><strong>Name:</strong> ${data.BOOKING_NAME}  </p>
      <p><strong>Phone Number:</strong> ${data.BOOKING_TEL}  </p>
      <p><strong>Persons:</strong> ${data.BOOKING_PAX} pax </p>
      <p><strong>Remarks:</strong> ${data.BOOKING_REMARKS}  </p>
      
      <p>A confirmation e-mail will be sent to you upon confirmation of the booking, thank you.</p>
      <p><strong>Seri Padi De Cabin Management</strong></p>
      `;

        await sendEmail(data.BOOKING_EMAIL, subject, text, html);

        break;
      default:
        break;
    }

  } catch (error) {
    console.log(error);
  }
}

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

router.get('/fetch_by_email/:email', async (req, res) => {
  try {
    // Get the table with the specified ID
    const tableEmail = req.params.email;
    console.log(req.params);
    console.log(`tableEmail: ${tableEmail}`);
    if (tableEmail) {
      // const result = await database.read(DB_TABLE, DB_TABLE_PK, tableID);
      const result = await fetchBookingsForEmail(tableEmail);

      const dateObj = new Date(result.BOOKING_DATE);
      const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
      const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
      result.BOOKING_DATE = `${formattedDate} ${formattedTime}`;

      console.log(`tables: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

async function fetchBookingsForEmail(email) {
  try {
    // Query the database for bookings associated with the user
    const result = await database.readMany(DB_TABLE, "BOOKING_EMAIL", email);
    return result; // Return the fetched bookings data
  } catch (err) {
    throw new Error(`Failed to fetch bookings: ${err.message}`);
  }
}

// router.put('/:id', async (req, res) => {
//   try {
//     // Update the table with the specified ID
//     const tableId = req.params.id;
//     console.log(`tableId: ${tableId}`);
//     const table = req.body;

//     if (tableId && table) {
//       delete table.id;
//       console.log(`table: ${JSON.stringify(table)}`);
//       const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);
//       res.status(200).json({ rowsAffected });
//     } else {
//       res.status(404);
//     }
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// });

router.put('/:id', async (req, res) => {
  console.log('connect')
  try {
    const tableId = req.params.id;
    const table = req.body;

    console.log(tableId)
    console.log(table)

    if (tableId && table) {
      delete table.id;
      const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404).json({ error: 'Booking ID and data are required' });
    }
  } catch (err) {
    console.log(err)
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