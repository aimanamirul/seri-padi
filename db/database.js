import sql from 'mssql';
import { config } from './config.js';
import bcrypt from 'bcrypt';
import generateRandomString from '../util/generateRandomString.js';

const randomString = generateRandomString(8);

export default class Database {
    config = config;
    poolconnection = null;
    connected = false;

    constructor(config) {
        this.config = config;
        console.log(`Database: config: ${JSON.stringify(config)}`);
    }

    async connect() {
        try {
            console.log(`Database connecting...${this.connected}`);
            if (this.connected === false) {
                this.poolconnection = await sql.connect(this.config);
                this.connected = true;
                console.log('Database connection successful');
            } else {
                console.log('Database already connected');
            }
        } catch (error) {
            console.error(`Error connecting to database: ${JSON.stringify(error)}`);
        }
    }

    async disconnect() {
        try {
            this.poolconnection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error(`Error closing database connection: ${error}`);
        }
    }

    async executeQuery(query) {
        await this.connect();
        const request = this.poolconnection.request();
        const result = await request.query(query);

        return result.rowsAffected[0];
    }

    // async create(tableName, id_var, data) {
    //     await this.connect();
    //     const request = this.poolconnection.request();

    //     const id = data[id_var] ? data[id_var] : generateRandomString(8);

    //     // const columns = Object.keys(data).join(', ');
    //     // const values = Object.keys(data).map(key => `@${key}`).join(', ');

    //     const columns = [`${id_var}`, ...Object.keys(data)].join(', ');
    //     const values = [`@${id_var}`, ...Object.keys(data).map(key => `@${key}`)].join(', ');

    //     request.input(`${id_var}`, sql.NVarChar(255), id);
    //     Object.entries(data).forEach(([key, value]) => {
    //         request.input(key, sql.NVarChar(255), value);
    //     });

    //     const result = await request.query(
    //         `INSERT INTO ${tableName} (${columns}) VALUES (${values})`
    //     );

    //     return result.rowsAffected[0];
    // }

    async create(tableName, id_var, data) {
        await this.connect();
        const request = this.poolconnection.request();

        // Check if data contains id_var, otherwise generate a new one
        const id = data[id_var] ? data[id_var] : generateRandomString(8);

        // Prepare columns and values for the SQL statement
        const columns = Object.keys(data).includes(id_var)
            ? Object.keys(data).join(', ')
            : [`${id_var}`, ...Object.keys(data)].join(', ');

        const values = Object.keys(data).includes(id_var)
            ? Object.keys(data).map(key => `@${key}`).join(', ')
            : [`@${id_var}`, ...Object.keys(data).map(key => `@${key}`)].join(', ');

        // Set the ID in the request if it wasn't included in data
        if (!data[id_var]) {
            request.input(`${id_var}`, sql.NVarChar(255), id);
        }

        // Set other data inputs
        Object.entries(data).forEach(([key, value]) => {
            request.input(key, sql.NVarChar(255), value);
        });

        const result = await request.query(
            `INSERT INTO ${tableName} (${columns}) VALUES (${values})`
        );

        return result.rowsAffected[0];
    }

    async readAll(tableName) {
        await this.connect();
        const request = this.poolconnection.request();
        const result = await request.query(`SELECT * FROM ${tableName}`);

        return result.recordsets[0];
    }

    async read(tableName, id_var, id) {
        await this.connect();

        const query = `SELECT * FROM ${tableName} WHERE ${id_var} = '${id}'`;
        console.log(query);

        const request = this.poolconnection.request();
        const result = await request
            // .query(`SELECT * FROM ${tableName} WHERE ${id_var} = '${id}'`);
            .query(query);

        return result.recordset[0];
    }

    async readMany(tableName, id_var, id) {
        await this.connect();

        const query = `SELECT * FROM ${tableName} WHERE ${id_var} = '${id}'`;
        console.log(query);

        const request = this.poolconnection.request();
        const result = await request
            // .query(`SELECT * FROM ${tableName} WHERE ${id_var} = '${id}'`);
            .query(query);

        return result.recordset;
    }

    async update(tableName, idVar, id, data) {
        await this.connect();

        const request = this.poolconnection.request();
        const updateSet = Object.keys(data).map(key => `${key}=@${key}`).join(', ');

        request.input('id', sql.VarChar, id);
        Object.entries(data).forEach(([key, value]) => {
            request.input(key, sql.NVarChar(255), value);
        });

        // request.input('id', sql.Int, +id);
        // request.input('firstName', sql.NVarChar(255), data.firstName);
        // request.input('lastName', sql.NVarChar(255), data.lastName);

        // const result = await request.query(
        //   `UPDATE Person SET firstName=@firstName, lastName=@lastName WHERE id = @id`
        // );

        const result = await request.query(
            `UPDATE ${tableName} SET ${updateSet} WHERE ${idVar} = @id`
        );

        return result.rowsAffected[0];
    }

    async delete(tableName, idVar, id) {
        await this.connect();

        const request = this.poolconnection.request();
        const result = await request
            .input('id', sql.VarChar, id)
            .query(`DELETE FROM ${tableName} WHERE ${idVar} = @id`);

        return result.rowsAffected[0];
    }

    // SP_BOOKINGS SPECIFIC FUNC
    async availabiltyCheck(id, req_start, req_end) {
        await this.connect();

        const request = this.poolconnection.request();
        request.input('id_table', sql.VarChar, id);
        request.input('requested_start', sql.DateTime, req_start);
        request.input('requested_end', sql.DateTime, req_end);

        const result = await request.query(`
            SELECT 
              COUNT(*) AS conflicting_bookings
            FROM 
              SP_BOOKINGS
            WHERE 
              id_table = @id_table
              AND (
                (@requested_start BETWEEN booking_date_start AND booking_date_end)
                OR (@requested_end BETWEEN booking_date_start AND booking_date_end)
                OR (booking_date_start BETWEEN @requested_start AND @requested_end)
                OR (booking_date_end BETWEEN @requested_start AND @requested_end)
              )
        `);

        return result.recordset[0].conflicting_bookings === 0;
    }

    // SP_USERS LOGIN
    async authenticateUser(username, password) {
        try {
            await this.connect();

            const request = this.poolconnection.request();
            request.input('username', sql.NVarChar(255), username);

            const result = await request.query(
                `SELECT * FROM SP_USERS WHERE username = @username`
            );

            if (result.recordset.length === 0) {
                return null; // User not found
            }

            const user = result.recordset[0];
            // console.log(user);
            // Compare hashed password
            const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
            if (passwordMatch) {
                // Remove sensitive data before returning user object
                delete user.PASSWORD;
                return user;
            } else {
                return null; // Incorrect password
            }
        } catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }
}