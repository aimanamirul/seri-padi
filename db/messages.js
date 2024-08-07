import express from 'express';
import dotenv from 'dotenv';
import { config } from './config.js';
import Database from './database.js';
import { sendEmail } from '../util/emailer.js';
import EmailActions from '../actions/EmailActions.js';

const router = express.Router();
router.use(express.json());

dotenv.config();
const emailActions = new EmailActions();

// Create database object
const database = new Database(config);
const DB_TABLE = 'SP_MESSAGES'
const DB_TABLE_PK = 'ID_MESSAGE'

router.post('/create', async (req, res) => {
    try {
        // Create a table
        const data = req.body;
        console.log(`data: ${JSON.stringify(data)}`);
        const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
        if (rowsAffected) {
            res.status(201).json({ rowsAffected });
            await emailActions.emailerSend("newMessageSent", data)
            // await sendEmail(email, subject, text, html);

        } else {
            res.status(500).json({ error: 'Failed to create booking.' });
        }

    } catch (err) {
        res.status(500).json({ error: err?.message });
    }
});

export default router;