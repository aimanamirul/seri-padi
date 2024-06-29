// index.js
import sql from 'mssql';
import { config } from './config.js';

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

console.log("Starting...");
connectAndQuery();

async function connectAndQuery() {
    try {
        const poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        const resultSet = await poolConnection.request().query(`
            SELECT *
            FROM [dbo].[SP_USERS]
        `);

        console.log(`${resultSet.recordset.length} rows returned.`);

        // Output column headers
        const columns = Object.keys(resultSet.recordset.columns).join(', ');
        console.log(columns);

        // Output row contents
        resultSet.recordset.forEach(row => {
            console.log(`${row.ID}\t${row.NAME}\t${row.REGISTERED_USER_FLAG}`);
        });

        // Close connection
        await poolConnection.close();
    } catch (err) {
        console.error(err.message);
    }
}
