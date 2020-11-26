const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

require("dotenv").config();

// Connect to DB
const db = require('./config/database');
// Comment the below line if didn't install MySQL yet
db.connectToDB();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

//EJS & Styles
app.set('view engine', 'ejs');
app.use(express.static("public"));

//BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Express Session
app.use(session({
  secret: "secrets",
  resave: true,
  saveUninitialized: true,
}));

//Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
  // res.locals.success_msg = req.flash('success_msg');
  // res.locals.error_msg = req.flash('error_msg');
  // res.locals.error = req.flash('error');
  res.locals.isLoggedIn = typeof req.user !== 'undefined' ? true : false;
  next();
});

//Routes Linking
app.use('/', require("./routes"));
app.use('/users', require('./routes/user'));

app.listen(PORT, err => {
  if (err) return console.error(err);
  console.log(`Server is listening at http://${HOST}:${PORT}`);
});