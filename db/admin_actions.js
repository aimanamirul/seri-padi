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

// router.get('/', async (_, res) => {
//   try {
//     // Return a list of users
//     const users = await database.readAll(DB_TABLE);
//     console.log(`users: ${JSON.stringify(users)}`);
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// });

// router.post('/create', async (req, res) => {
//   try {
//     // Create a table
//     const data = req.body;
//     console.log(`data: ${JSON.stringify(data)}`);
//     const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
//     if (rowsAffected) {
//       res.status(201).json({ rowsAffected });

//       // const subject = 'Booking Confirmation';
//       // const text = `Dear ${data.BOOKING_NAME}, your booking has been confirmed for ${data.BOOKING_DATE_START}.`;
//       // const html = `<p>Dear ${data.BOOKING_NAME},</p>
//       // <p>Your booking has been confirmed for ${data.BOOKING_DATE_START}.</p>
//       // <p>Booking ID: ${data.ID_BOOKING}  </p>`;

//       const subject = 'Booking Submitted';
//       const text = `Dear ${data.BOOKING_NAME}, we have received your booking for ${data.BOOKING_DATE}.`;
//       const html = `<p>Dear ${data.BOOKING_NAME},</p>
//       <p>We have received your for ${data.BOOKING_DATE_START}.</p>
//       <p><strong>Booking Tracking Number:</strong> ${data.ID_BOOKING}  </p>
//       <p><strong>Name</strong> ${data.BOOKING_NAME}  </p>
//       <p><strong>Phone Number:</strong> ${data.BOOKING_TEL}  </p>
//       <p><strong>Persons:</strong> ${data.BOOKING_PAX} pax </p>
//       <p><strong>Remarks:</strong> ${data.BOOKING_REMARKS}  </p>

//       <p>A confirmation e-mail will be sent to you upon confirmation of the booking, thank you.</p>
//       <p><strong>Seri Padi De Cabin Management</strong></p>
//       `;

//       await sendEmail(data.BOOKING_EMAIL, subject, text, html);

//     } else {
//       res.status(500).json({ error: 'Failed to create booking.' });
//     }

//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// });

// router.get('/:id', async (req, res) => {
//   try {
//     // Get the table with the specified ID
//     const tableID = req.params.id;
//     console.log(`tableId: ${tableID}`);
//     if (tableID) {
//       const result = await database.read(DB_TABLE, DB_TABLE_PK, tableID);
//       console.log(`tables: ${JSON.stringify(result)}`);
//       res.status(200).json(result);
//     } else {
//       res.status(404);
//     }
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// });

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

function padZero(num) {
    return num.toString().padStart(2, '0');
}

router.put('/:id', async (req, res) => {
    console.log('connect')
    try {
        const bookingId = req.params.id;
        const bookingData = req.body;

        console.log(bookingId)
        console.log(bookingData)

        if (bookingId && bookingData) {
            delete bookingData.id;
            const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, bookingId, bookingData);

            const result = await database.read(DB_TABLE, DB_TABLE_PK, bookingId);

            if (!result) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            const bookingDate = new Date(result.BOOKING_DATE);
            const bookingDateISO = bookingDate.toISOString()
            const dateObj = new Date(bookingDateISO);
            const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
            const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
            const readableDate = `${formattedDate} ${formattedTime}`;

            if (result.BOOKING_STATUS === "C") {
                const subject = `Table Booking Confirmed - ${result.ID_BOOKING}`;
                const text = `Dear ${result.BOOKING_NAME}, your booking is now confirmed for ${readableDate}.`;
                const html = `<p>Dear ${result.BOOKING_NAME},</p>
          <p>Your booking for ${readableDate} is now confirmed.</p>
          <p><strong>Booking Tracking Number:</strong> ${result.ID_BOOKING}  </p>
          <p><strong>Name:</strong> ${result.BOOKING_NAME}  </p>
          <p><strong>Phone Number:</strong> ${result.BOOKING_TEL}  </p>
          <p><strong>Persons:</strong> ${result.BOOKING_PAX} pax </p>
          <p><strong>Remarks:</strong> ${result.BOOKING_REMARKS}  </p>
    
          <p>Please call us at  017-324 4866 for further inquiries, thank you.</p>
          <p><strong>Seri Padi De Cabin Management</strong></p>
          `;
                await sendEmail(result.BOOKING_EMAIL, subject, text, html);
            } else if (result.BOOKING_STATUS === "X") {
                const subject = `Table Booking Cancelled - ${result.ID_BOOKING}`;
                const text = `Dear ${result.BOOKING_NAME}, your booking for ${readableDate} was cancelled.`;
                const html = `<p>Dear ${result.BOOKING_NAME},</p>
          <p>Unfortunately your booking for ${readableDate} has been cancelled.</p>
          <p><strong>Booking Tracking Number:</strong> ${result.ID_BOOKING}  </p>
          <p><strong>Name:</strong> ${result.BOOKING_NAME}  </p>
          <p><strong>Phone Number:</strong> ${result.BOOKING_TEL}  </p>
          <p><strong>Persons:</strong> ${result.BOOKING_PAX} pax </p>
          <p><strong>Remarks:</strong> ${result.BOOKING_REMARKS}  </p>
    
          <p>Please call us at  017-324 4866 for further inquiries, thank you.</p>
          <p><strong>Seri Padi De Cabin Management</strong></p>
          `;
                await sendEmail(result.BOOKING_EMAIL, subject, text, html);
            }

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
        // console.log(`tableId: ${tableId}`);

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