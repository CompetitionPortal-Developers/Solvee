const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

const app = express();

require("dotenv").config();

//Passport config
require("./config/passport")(passport);

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to DB
const db = require('./config/database');
db.connectToDB();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

//EJS & Styles
app.set('view engine', 'ejs');
app.use(express.static("public"));

//Express Session
app.use(session({
  secret: "secrets",
  resave: true,
  saveUninitialized: true,
}));

//Passport middleWare
app.use(passport.initialize());
app.use(passport.session());

// connect-flash & express-messages middlewares
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Routes Linking
app.use('/', require("./routes"));
app.use('/support-us', require("./routes/donation"));
app.use('/competitions', require("./routes/competition"));
app.use('/exams', require("./routes/exam"));
app.use('/users', require('./routes/user'));
app.use('/tournaments', require("./routes/tournament"));

//db.endDBConnection();

app.listen(PORT, err => {
  if (err) return console.error(err);
  console.log(`Server is listening at http://${HOST}:${PORT}`);
});