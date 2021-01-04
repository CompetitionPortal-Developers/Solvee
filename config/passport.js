const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { DBconnection } = require("./database");

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        //Match User
        DBconnection.query("select * from dbproject.user where email='" + email + "'", (err, user) => {
            if (err) return console.log(err);
            if (!user[0]) return done(null, false, { message: "That E-mail Isn't Found" });
            const userPass = user[0].pass;
            bcrypt.compare(password, userPass, (err, isMatch) => {
                if (err) return console.log(err);
                if (isMatch) return done(null, user[0]);
                return done(null, false, { message: "wrong password" });
            });//end of compare
        });
    }));

    passport.serializeUser((user, done) => done(null, user.ID));

    passport.deserializeUser((ID, done) => {
        DBconnection.query('select * from dbproject.user where ID=' + ID, (err, results) => {
            if (err) return console.log(err);
            if (results[0]) return done(null, results[0]);
        });
    });
}