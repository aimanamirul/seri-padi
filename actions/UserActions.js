// actions/UserActions.js

import { config } from '../db/config.js';
import { padZero, generateRandomString } from '../util/utilities.js';
import Database from '../db/database.js';
import bcrypt from 'bcrypt';

const database = new Database(config);
const DB_TABLE = 'SP_USERS';
const DB_TABLE_PK = 'ID_USER';

class UserActions {
  async createUser(data) {
    try {
      let emailFlag = false;
      let usernameFlag = false;

      const existingEmail = await database.readWithClause(DB_TABLE, { EMAIL: data.EMAIL });
      if (existingEmail) {
        emailFlag = true;
      }

      const existingUsername = await database.readWithClause(DB_TABLE, { USERNAME: data.USERNAME });
      if (existingUsername) {
        usernameFlag = true;
      }

      if (emailFlag || usernameFlag) {
        let errorString = " already exists";
        const emailStr = "Email";
        const usernameStr = "Username";

        if (emailFlag && usernameFlag) {
          errorString = emailStr + " and " + usernameStr + errorString;
        } else if (emailFlag) {
          errorString = emailStr + errorString;
        } else if (usernameFlag) {
          errorString = usernameStr + errorString;
        }

        throw new Error(errorString);
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(data.PASSWORD, salt);

      data.PASSWORD = hashedPassword;
      data.ROLE = "USER";

      const rowsAffected = await database.create(DB_TABLE, DB_TABLE_PK, data);
      return { rowsAffected };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getUserById(id) {
    try {
      const result = await database.read(DB_TABLE, DB_TABLE_PK, id);
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateUser(id, newData) {
    try {
      delete newData.id; // Ensure no 'id' field is passed to update function
      const rowsAffected = await database.update(DB_TABLE, DB_TABLE_PK, id, newData);
      return { rowsAffected };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteUser(id) {
    try {
      const rowsAffected = await database.delete(DB_TABLE, DB_TABLE_PK, id);
      return { rowsAffected };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async authenticateUser(username, password) {
    try {
      const user = await database.authenticateUser(username, password);
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async fetchUserById(id) {
    try {
      // Query the database for bookings associated with the user
      const result = await database.read(DB_TABLE, DB_TABLE_PK, id);
      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }

  async fetchBookingsForEmail(email) {
    try {
      // Query the database for bookings associated with the user
      let result = await database.readMany("SP_BOOKINGS", "BOOKING_EMAIL", email);

      result.forEach(booking => {
        const dateObj = new Date(booking.BOOKING_DATE);
        const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
        const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
        booking.BOOKING_DATE = `${formattedDate} ${formattedTime}`;
        console.log(booking.BOOKING_DATE)
      });


      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }

  async fetchMsgAll() {
    try {
      // Query the database for bookings associated with the user
      const result = await database.readAll("SP_MESSAGES");
      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }

  async fetchUsersAll() {
    try {
      // Query the database for bookings associated with the user
      const result = await database.readAll("SP_USERS");
      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }

  async fetchBookingsForUser(userId) {
    try {
      // Query the database for bookings associated with the user
      const result = await database.readMany("SP_BOOKINGS", "ID_USER", userId);
      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }

  async fetchBookingsAll() {
    try {
      // Query the database for bookings associated with the user
      const result = await database.readAll("SP_BOOKINGS");

      result.forEach(booking => {
        const dateObj = new Date(booking.BOOKING_DATE);
        const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
        const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
        booking.BOOKING_DATE = `${formattedDate} ${formattedTime}`;
        console.log(booking.BOOKING_DATE)
      });

      return result; // Return the fetched bookings data
    } catch (err) {
      throw new Error(`Failed to fetch bookings: ${err.message}`);
    }
  }
}



export default UserActions;
