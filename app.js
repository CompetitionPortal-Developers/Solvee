const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;

//EJS & Styles
app.set('view engine', 'ejs');
app.use(express.static("public"));

//BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Database Connection Setup
// const con = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '0110084949',
//   database: 'database1',
// });
// con.connect((err) => {
//   if (err) {
//     console.log('Error connecting to DB');
//     console.log(err);
//     return;
//   }
//   console.log('Connection Established');
// });
// con.end((err) => {
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
  console.log("Server is connected on localhost port 3000");
});