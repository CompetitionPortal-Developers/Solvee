const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const passport=require("passport");

const app = express();

require("dotenv").config();

//Passport config
require("./config/passport")(passport);



//BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




// Connect to DB
const db = require('./config/database');
// Comment the below line if didn't install MySQL yet
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

//Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.isLoggedIn = typeof req.user !== 'undefined' ? true : false;
  next();
});



//Routes Linking
app.use('/', require("./routes"));
app.use('/users', require('./routes/user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



app.listen(PORT, err => {
  if (err) return console.error(err);
  console.log(`Server is listening at http://${HOST}:${PORT}`);
});