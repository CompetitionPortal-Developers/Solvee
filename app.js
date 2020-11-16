const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

//EJS & Styles
app.set('view engine', 'ejs');
app.use(express.static("public"));

//BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
* comment the below part if didn't install MySQL yet
*/
//Database Connection Setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0110084949',
  database: 'database1',
});
db.connect((err) => {
  if (err) return console.log('Error connecting to DB', err);
  console.log('***DB Connected***');
});
// db.end((err) => {
//   // The connection is terminated gracefully
//   // Ensures all remaining queries are executed
//   // Then sends a quit packet to the MySQL server.
// });

//Connect flash
app.use(flash());

//Routes Linking
app.use('/', require("./routes"));
app.use('/users', require('./routes/user'));

//Express Session
app.use(session({
  secret: "secrets",
  resave: true,
  saveUninitialized: true,
}));

//Global vars for errors
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.listen(PORT, err => {
  if (err) return console.log(err);
  console.log(`Server is listening at http://${HOST}:${PORT}`);
});