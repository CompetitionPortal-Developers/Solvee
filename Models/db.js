const mysql = require('mysql');
const q = require("./queries");

// First you need to create a connection to the database
// Be sure to replace 'user' and 'password' with the correct values
// const con = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '0110084949',
//   database: 'database1',
// });


// con.connect(( err) => {
//   if(err){
//     console.log('Error connecting to Db');
//     console.log(err);
//     return;
//   }
//   console.log('Connection established');
// });


var set = {
  name: "fname",
  value: "ghareeb"
};
var loc = {
  name: "ID",
  value: "1"
};
var insertQuery = q.Update(set, "company", loc);
con.query(insertQuery, (err, rows) => {
  if (err) { throw err; }
  console.log("violation is done")
})

con.query('SELECT * FROM emp', (err, rows) => {
  if (err) throw err;
  console.log('Data received from Db:');
  console.log(rows.length);
});

con.end(err => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});