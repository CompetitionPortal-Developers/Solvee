var express = require('express');
const router = express.Router();
const { queryDB } = require("../config/database");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get('/user', (req, res) => {
    const errors = [];
    queryDB('SELECT * FROM dbproject.user', (err, rows) => {
        if (err) return console.error(err);
        console.log(rows[0].ID);
        res.render("user-profile", {
            title: "User",
            errors,
            rows
        });
    });
});

router.get('/login', (req, res) => {
    const errors = [];
    res.render("login", {
        title: "Login",
        errors
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res) => {
    const errors = [];
    res.render("register", {
        title: "Register",
        errors
    });
});

router.post("/register", (req, res) => {
    let errors = [];
    let { firstname, lastname, username, email, password, password2 } = req.body;

    //Check required fields
    if (!username || !email || !password || !password2 || !lastname || !firstname) {
        errors.push({ msg: "Please Fill In All Fields" });
    }
    // //Check password match
    if (password !== password2) {
        errors.push({ msg: "Passwords don't match" });
    }
    //Check pass length
    if (password.length < 7) {
        errors.push({ msg: "Password should be at least 7 characters" });
    }

    //encrypting
    //ID is static so we should change it later IMPORTANT NOTE
    if (errors.length > 0)
        return res.render("register", {
            title: "Register",
            errors,
            email,
            username,
            firstname,
            lastname
        });

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return console.error(err);
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) return console.log(err);
            password = hash;
            const query = 'Insert into dbproject.user (ID,Username,email,pass,firstname,lastname) '
                + 'values(1,"' + username + '","' + email + '","' + hash + '","' + firstname + '","' + lastname + '");'
            queryDB(query, (err, results, fields) => {
                if (err) return console.log(err);
                res.flash("success", "registered succesfully");
                res.redirect("/login");
            });
        });
    });
});

router.get('/:id', (req, res) => {
    const errors = [];
    queryDB('SELECT * FROM dbproject.user WHERE user.ID=' + req.params.id, (err, rows) => {
        if (err) return console.error(err);
        console.log(rows);
        res.render("user-profile", {
            title: "User",
            errors,
            rows
        });
    });
});

module.exports = router;