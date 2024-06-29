// index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import openapi from './db/openapi.js';
import tables from './db/tables.js';
import users from './db/users.js';
import bookings from './db/bookings.js';

const __dirname = path.resolve();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/openapi', openapi);
app.use('/tables', tables);
app.use('/bookings', bookings);
app.use('/users', users);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
