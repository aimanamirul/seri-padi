import express from 'express';
import { config } from './config.js';
import { padZero, generateRandomString } from '../util/utilities.js';
import Database from './database.js';
import UserActions from '../actions/UserActions.js';
import Booking from './bookings.js'
import bcrypt from 'bcrypt';
import path from 'path';
import { sendEmail } from '../util/emailer.js';
// import generateRandomString from '../util/generateRandomString.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import dotenv from 'dotenv';
dotenv.config();
const siteUrl = process.env.SITE_URL;

// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const router = express.Router();
router.use(express.json());

// Serve static files from the public directory
router.use(express.static(path.join(__dirname, 'public')));

const database = new Database(config);
const userActions = new UserActions();
const DB_TABLE = 'SP_USERS';
const DB_TABLE_PK = 'ID_USER';

router.post('/', async (req, res) => {
  try {

    let emailFlag = false;
    let usernameFlag = false;

    const data = req.body;
    console.log(data);
    const existingEmail = await database.readWithClause(DB_TABLE, { EMAIL: data.EMAIL });
    if (existingEmail) {
      console.log('existing email found');
      // return res.status(400).json({ error: "Email already exists" });
      emailFlag = true;
    }

    const existingUsername = await database.readWithClause(DB_TABLE, { USERNAME: data.USERNAME });
    if (existingUsername) {
      // return res.status(400).json({ error: "Username already exists" });
      usernameFlag = true;
    }

    if (emailFlag || usernameFlag) {
      let errorString = " already exists"
      const emailStr = "Email"
      const usernameStr = "Username"

      if (emailFlag && usernameFlag) {
        errorString = emailStr + " and " + usernameStr + errorString
      } else if (emailFlag) {
        errorString = emailStr + errorString
      } else if (usernameStr) {
        errorString = usernameStr + errorString
      }

      return res.status(400).json({ error: errorString });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(data.PASSWORD, salt);

    data.PASSWORD = hashedPassword;
    data.ROLE = "USER";

    const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    console.log(err)
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
      res.status(404).json({ error: 'User ID and data are required' });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err?.message });
  }
});

router.put('/update/:id', async (req, res) => {
  console.log('connect')
  try {
    const tableId = req.params.id;
    const table = req.body;

    console.log(tableId)
    console.log(table)

    if (tableId && table) {
      delete table.id;
      const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);

      const user = await database.read(DB_TABLE, DB_TABLE_PK, tableId);
      req.session.user = user;

      res.status(200).json({ rowsAffected });
    } else {
      res.status(404).json({ error: 'User ID and data are required' });
    }
  } catch (err) {
    console.log(err)
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
      console.log(user)
      return res.status(200).json({ message: 'Login successful', role: user.ROLE });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    // res.redirect('/login'); // Redirect to login if not authenticated
    const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
    return res.sendFile(htmlPath);
  }
}

router.get('/bookings_page', requireAuth, async (req, res) => {
  try {
    if (!req.session.user) {
      // If user is not logged in, return a page indicating login is required
      const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
      return res.sendFile(htmlPath);
    } else {
      // User is logged in, fetch bookings for the user
      // const userId = req.session.user.ID_USER;
      // const bookings = await fetchBookingsForUser(userId);
      const email = req.session.user.EMAIL;
      const user = req.session.user
      console.log(user)
      const bookingsList = await userActions.fetchBookingsForEmail(email);
      console.log('Bookings:', bookingsList);

      // Render the bookings.ejs file with the bookings data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.render('bookings', { bookingsList, user });
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/view_user/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      // If user is not logged in, return a page indicating login is required
      // const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
      // return res.sendFile(htmlPath);
      return res.redirect('/users/bookings_page');
    } else {
      const user = req.session.user
      console.log(user)
      const viewUserId = req.params.id;
      const viewUser = await userActions.fetchUserById(viewUserId); //change here
      const bookingsList = await userActions.fetchBookingsForEmail(viewUser.EMAIL)
      // Render the bookings.ejs file with the bookings data
      res.render('admin_view_user', { bookingsList, viewUser });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/register_page', async (req, res) => {
  try {
    // if (!req.session.user) {
    //   // If user is not logged in, return a page indicating login is required
    //   return res.sendFile(htmlPath);
    // } else {
    //   // User is logged in, fetch bookings for the user
    //   const userId = req.session.user.ID_USER;
    //   const bookings = await fetchBookingsForUser(userId);
    //   console.log('Bookings:', bookings);

    //   // Render the bookings.ejs file with the bookings data
    //   res.render('bookings', { bookings });
    // }
    const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
    return res.sendFile(htmlPath);
  } catch (err) {
    // console.error('Error fetching bookings:', err);
    // res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/forgot_password/:verifyCode?', async (req, res) => {
  try {
    const verifyCode = req.params.verifyCode || req.query.verifyCode;
    if (verifyCode) {
      const user = await database.readWithClause(DB_TABLE, { VERIFY_CODE: verifyCode });
      res.render('user_reset', { user: user || {} });
    } else {
      res.render('user_reset', { user: {} });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/forgot_password', async (req, res) => { //send email and generate verify code
  try {
    const data = req.body;
    const existingEmailUser = await database.readWithClause(DB_TABLE, { EMAIL: data.EMAIL });
    if (existingEmailUser) {
      console.log('user ' + JSON.stringify(existingEmailUser))

      const tableId = existingEmailUser.ID_USER;
      const verifyCode = generateRandomString(10)
      const table = { "VERIFY_CODE": verifyCode };

      console.log(tableId)
      console.log(table)

      if (tableId && table) {
        delete table.id;
        const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, table);

        if (rowsAffected) {
          const subject = 'Password Reset Request';
          const text = `Dear ${existingEmailUser.NAME}, we have received a password reset request.`;
          const html = `<p>Dear ${existingEmailUser.NAME},</p>
      <p>We have received a password reset request.</p>
      <p>Please proceed to the following link to reset your password.</p>
      <a href="${siteUrl}/users/forgot_password/${verifyCode}">Reset Password Link</a>
      <p>Thank you.</p>
      <p><strong>Seri Padi De Cabin Management</strong></p>
      `;

          await sendEmail(existingEmailUser.EMAIL, subject, text, html);
        }

        res.status(200).json({ rowsAffected });
      } else {
        res.status(404).json({ error: 'An Error has occurred! Please try again later.' });
      }
    } else {
      let errorString = "Email address not found";
      return res.status(400).json({ error: errorString });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err?.message });
  }

});

router.post('/profile_reset_password', async (req, res) => {
  try {
    const data = req.body;
    // const existingEmailUser = await database.readWithClause(DB_TABLE, { ID_USER: data.ID_USER });
    const user = await database.authenticateUser(data.USERNAME, data.OLD_PASSWORD);
    if (user) {
      console.log('user ' + JSON.stringify(user))

      const tableId = user.ID_USER;
      // const table = {PASSWORD};
      const updateData = { PASSWORD: data.PASSWORD };

      // console.log(tableId)
      // console.log(data)

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(data.PASSWORD, salt);
      updateData.PASSWORD = hashedPassword;
      // data.VERIFY_CODE = null;

      if (tableId && data) {
        delete data.ID_USER;
        const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, updateData);
        res.status(200).json({ rowsAffected });
      } else {
        res.status(404).json({ error: 'An Error has occurred! Please try again later.' });
      }
    } else {
      let errorString = "Unable to authenticate! Please enter correct current password.";
      return res.status(400).json({ error: errorString });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err?.message });
  }
});

router.post('/reset_password', async (req, res) => {
  try {
    console.log('reset password route')
    const data = req.body;
    const existingEmailUser = await database.readWithClause(DB_TABLE, { ID_USER: data.ID_USER });
    if (existingEmailUser) {
      console.log('user ' + JSON.stringify(existingEmailUser))

      const tableId = existingEmailUser.ID_USER;
      // const table = {PASSWORD};

      console.log(tableId)
      console.log(data)

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(data.PASSWORD, salt);
      data.PASSWORD = hashedPassword;
      data.VERIFY_CODE = null;

      if (tableId && data) {
        delete data.ID_USER;
        const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, tableId, data);
        res.status(200).json({ rowsAffected });
      } else {
        res.status(404).json({ error: 'An Error has occurred! Please try again later.' });
      }
    } else {
      let errorString = "No user was found.";
      return res.status(400).json({ error: errorString });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err?.message });
  }
});

router.get('/admin_page', async (req, res) => {
  try {
    if (!req.session.user) {
      // If user is not logged in, return a page indicating login is required
      const htmlPath = path.resolve(__dirname, 'public', 'require_login.html');
      return res.sendFile(htmlPath);
    } else {
      // User is logged in, fetch bookings for the user
      const userId = req.session.user.ID_USER;
      const bookingsList = await userActions.fetchBookingsAll();
      const usersList = await userActions.fetchUsersAll();
      const msgList = await userActions.fetchMsgAll();
      console.log('Bookings:', bookingsList);

      // Render the bookings.ejs file with the bookings data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.render('admin_dashboard', { bookingsList, usersList, msgList });
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

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
