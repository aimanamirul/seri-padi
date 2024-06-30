// index.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';

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

app.set('view engine', 'ejs');

// Configure express-session
app.use(session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'index.html'));
    if (req.session && req.session.user) {
        res.render('index', { user: req.session.user });
    } else {
        res.render('index', { user: null });
    }
    // res.render('index');
});

app.use('/openapi', openapi);
app.use('/tables', tables);
app.use('/bookings', bookings);
app.use('/users', users);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
