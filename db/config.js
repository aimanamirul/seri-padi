import dotenv from 'dotenv';
dotenv.config();
const pwd = process.env.DB_PASS;

export const config = {
    user: 'seriadmin', // better stored in an app setting such as process.env.DB_USER
    password: pwd, // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'seripadi.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'seri-padi-sql', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}