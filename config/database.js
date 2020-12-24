const mysql = require('mysql');

//Database Connection Setup
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
});

module.exports = {
    connection: connection,
    connectToDB: () => {
        connection.connect(err => {
            if (err) return console.error('Error connecting to DB\n', err);
            console.log('***DB Connected***');
        });
    },
    queryDB: (queryString) => {
        connection.query(queryString, (err, rows) => {
            if (err) return console.error(err);
            return rows;
        });
    },
    endDBConnection: () => {
        // connection.end(err => {
        //   // if (err) return console.error(err);
        //   // The connection is terminated gracefully
        //   // Ensures all remaining queries are executed
        //   // Then sends a quit packet to the MySQL server.
        // });
    }
}