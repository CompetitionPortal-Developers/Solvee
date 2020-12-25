const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { DBconnection } = require("../config/database");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get('/user', (req, res) => {
    const errors = [];
    DBconnection.query('SELECT * FROM dbproject.user', (err, rows) => {
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
        title: "Log In",
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

router.post("/register", [
    body('firstname', 'First Name must be between 5 and 50 characters long').isLength({ min: 5, max: 50 }),
    body('lastname', 'Last Name must be between 5 and 50 characters long').isLength({ min: 5, max: 50 }),
    body('username', 'Userame must be between 5 and 50 characters long').isLength({ min: 5, max: 50 }),
    body('email', 'Email must be between 5 and 50 characters long').isLength({ min: 5, max: 50 }),
    body('email', 'Email not valid').isEmail(),
    body('password', 'Password must be at least 7 characters long').isLength({ min: 7 }),
    body('password', 'Password must be at most 255 characters long').isLength({ max: 255 }),
    body('password', 'Passwords must be equal').custom((value, { req, loc, path }) => {
        if (value !== req.body.password2)
            throw new Error("Passwords don't match");
        else
            return value;
    }),
    body('birthdate', 'Birth Date must be selected').notEmpty(),
    body('gender', 'Gender must be selected').notEmpty(),
], (req, res) => {
    console.log(req.body);
    let errors = validationResult(req).errors;
    let { firstname, lastname, username, email, password, password2, gender, birthdate } = req.body;

    if (username === "" || email === "" || password === "" || lastname === "" || firstname === "")
        errors.unshift({ msg: "Please Fill In All Fields" });

    if (errors.length)
        return res.render("register", {
            title: "Register",
            errors,
            email,
            username,
            firstname,
            lastname,
            gender,
            birthdate
        });

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return console.error(err);
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) return console.error(err);
            password = hash;
            const query = 'Insert into dbproject.user (Username,email,pass,gender,firstname,lastname,BirthDate) '
                + 'values("' + username + '","' + email + '","' + hash + '","' + gender + '","' + firstname + '","'
                + lastname + '","' + birthdate + '");'
            DBconnection.query(query, (err, results, fields) => {
                if (err) return console.error(err);
                req.flash("success", "You registered successfully. Please Log In");
                res.redirect("/users/login");
            });
        });
    });
});

router.get('/:username', (req, res) => {
    const errors = [];

    if (req.isAuthenticated()) {
        const query1 = "select * from dbproject.user where Username='" + req.params.username + "' ;";
        DBconnection.query(query1, (err, profileInfo) => {
            if (err) return console.error(err);
            const query2 = "select a.a_type, c.TITLE from dbproject.award as a,dbproject.competition as c "
                + ", dbproject.user as u where a.userID=u.ID and u.Username='" + req.params.username + "' and a.competitionID=c.C_ID";
            //Second query to get the awards of user
            DBconnection.query(query2, (err, awards) => {
                if (err) return console.error(err);
                //console.log(awards);
                let birthDate = "-";
                if (profileInfo[0].BirthDate)
                    birthDate = profileInfo[0].BirthDate.toString().slice(0, 16);

                res.render("user-profile", {
                    title: profileInfo[0].firstName + " " + profileInfo[0].lastName,
                    errors,
                    profileInfo,
                    birthDate,
                    awards
                });
            });
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.get('/:username/edit-profile', (req, res) => {
    if (req.isAuthenticated()) {
        const query = "select * from dbproject.user where Username='" + req.params.username + "' ;";
        DBconnection.query(query, (err, profileInfo) => {
            if (err) return console.error(err);
            console.log(profileInfo);
            if (req.user.ID !== profileInfo[0].ID) {
                req.flash('error', "You can't access this page.");
                return res.redirect(`/users/${req.user.Username}`);
            }
            res.render("edit-profile", {
                title: "Edit Profile"
            });
        });
    }
    else {
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }
});

router.post('/userProfile/edit', (req, res) => {
    const errors = []; //all errors push should be turned into req flash

    if (req.isAuthenticated()) {
        let query;
        console.log(req.body);
        if (req.body.firstName !== "") {
            if (req.body.firstName.length < 50) {
                query = "update user set firstName='" + req.body.firstName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "Error While Updating First Name");
                    }
                    console.log(results);
                })
            } else {
                req.flash("error_msg", "Too long String for First Name , Please Try Again");
            }
        }
        if (req.body.lastName !== "") {
            if (req.body.lastName.length < 50) {
                query = "update user set lastName='" + req.body.lastName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "Error While Updating Last Name");
                    }
                    console.log(results);
                });
            } else {
                req.flash("error_msg", "Too long String for Last Name , Please Try Again");
            }
        }
        if (req.body.username !== "") {
            if (req.body.username.length < 50) {
                query = "update user set Username='" + req.body.username + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "The Username Is Already Taken");
                    }
                    console.log(results);
                });
            } else {
                req.flash("error_msg", "Too long String for Username , Please Try Again");
            }
        }
        if (req.body.pass !== "") {
            if (req.body.confirmPass !== "") {
                if (req.body.pass === req.body.confirmPass) {
                    if (req.body.pass.length < 500) {
                        let password = req.body.pass
                        if (password.length < 7) {
                            req.flash("error_msg", "Password Must Contains At Least 7 Characters");
                        }
                        else {
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) return console.error(err);
                                bcrypt.hash(password, salt, (err, hash) => {
                                    if (err) return console.error(err);
                                    password = hash;
                                    query = "update user set pass='" + hash + "' where ID=" + req.user.ID + " ;";
                                    DBconnection.query(query, (err, results, fields) => {
                                        if (err) {
                                            console.log(err);
                                            req.flash("error_msg", "Error While Updating Password , PLease Try Agian");
                                        }
                                        console.log(results, fields);
                                    });
                                });
                            });
                        }
                    } else {
                        req.flash("error_msg", "Too long String for Password, Please Try Again");
                    }
                } else {
                    req.flash("error_msg", "The Two Passwords You Entered Are Different");
                }
            }
        } else {
            req.flash("success_msg", "Note Your Password Wasn't Changed");
        }
        if (req.body.education !== "") {
            if (req.body.username.length < 50) {
                query = "update user set education='" + req.body.education + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "The Education You Entered Is Invalid");
                    }
                    console.log(results);
                });
            } else {
                req.flash("error_msg", "Too long String for Education , Please Try Again");
            }
        }
        if (req.body.job !== "") {
            if (req.body.username.length < 50) {
                query = "update user set job='" + req.body.job + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "The Job You Entered Is Invalid");
                    }
                    console.log(results);
                });
            } else {
                req.flash("error_msg", "Too long String for Job , Please Try Again");
            }
        }
        if (req.body.bio !== "") {
            if (req.body.username.length < 300) {
                query = "update user set bio='" + req.body.bio + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error_msg", "The Bio You Entered Is Invalid");
                    }
                    console.log(results);
                });
            } else {
                req.flash("error_msg", "Too long String for Bio , Please Try Again");
            }
        }
        if (req.body.gender !== "") {
            query = "update user set gender='" + req.body.gender + "' where ID=" + req.user.ID + " ;";
            DBconnection.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    req.flash("error_msg", "The Gender You Entered Is Invalid");
                }
                console.log(results);
            });
        }
        if (req.body.date != "") {
            query = "update user set BirthDate='" + req.body.date + "' where ID=" + req.user.ID + " ;";
            DBconnection.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    req.flash("error_msg", "The BirthDate You Entered Is Invalid");
                }
                console.log(results);
            });
        }
        req.flash("success_msg", "Your Profile Is Updated");
        res.redirect("/users/userProfile/edit");
    }
    else {
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
})

module.exports = router;