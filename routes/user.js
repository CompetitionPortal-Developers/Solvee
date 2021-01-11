const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { DBconnection } = require("../config/database");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const dateFormatting = require('../config/date-formatting');

router.get('/login', (req, res) => {
    if (!req.isAuthenticated()) {
        const errors = [];
        res.render("login", {
            title: "Log In",
            errors
        });
    } else {
        req.flash('error', 'You are already login :)');
        res.redirect('/');
    }
});

router.post('/login', (req, res, next) => {
    if (!req.isAuthenticated()) {
        passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: "/users/login",
            failureFlash: true
        })(req, res, next);
    } else {
        req.flash('error', 'You are already login :)');
        res.redirect('/');
    }
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You are logged out");
    res.redirect("/users/login");
});

router.get('/register', (req, res) => {
    if (!req.isAuthenticated()) {
        const errors = [];
        res.render("register", {
            title: "Register",
            errors
        });
    } else {
        req.flash('error', 'You are already login :)');
        res.redirect('/');
    }
});

router.post("/register", [
    body('firstname', 'First Name must be between 5 and 50 characters long').isLength({ min: 2, max: 50 }),
    body('lastname', 'Last Name must be between 5 and 50 characters long').isLength({ min: 2, max: 50 }),
    body('username', 'Userame must be between 5 and 50 characters long').isLength({ min: 2, max: 50 }),
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
    if (!req.isAuthenticated()) {
        //console.log(req.body);
        let errors = validationResult(req).errors;
        let { firstname, lastname, username, email, password, gender, birthdate } = req.body;
        firstname = firstname.toString().replace(/'/g, "\\'");
        lastname = lastname.toString().replace(/'/g, "\\'");
        username = username.toString().replace(/'/g, "\\'");
        email = email.toString().replace(/'/g, "\\'");
        password = password.toString().replace(/'/g, "\\'");
        gender = gender.toString().replace(/'/g, "\\'");

        if (username === "" || email === "" || password === "" || lastname === "" || firstname === "") {
            errors.unshift({ msg: "Please Fill In All Fields" });
        }
        const yearOfBirth = birthdate.toString().slice(0, 4);
        if (yearOfBirth >= new Date(Date.now()).getFullYear() - 8) {
            errors.unshift({ msg: "You Must Be Older Than 8 Years Old To Register" });
        }
        const lastUsernameLength = username.length;
        username = username.toString().replace(/ /g, "");
        if (username.length < lastUsernameLength) {
            errors.unshift({ msg: "Username Can't Contain Spaces" });
        }

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
                let query = "";
                //checking if username already exists
                query = "select * from dbproject.user where email='" + email + "' ;";
                DBconnection.query(query, (err, rows) => {
                    if (err) { console.log(err); }
                    else {
                        if (rows.length > 0) {
                            req.flash("error", "The E-mail You Entered Is Already Taken , Please Try Again");
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
                        } else {
                            //checking if username already exists
                            query = "select * from dbproject.user where username='" + username + "' ;";
                            DBconnection.query(query, (err, rows) => {
                                if (err) { console.log(err); }
                                else {
                                    if (rows.length > 0) {
                                        req.flash("error", "The Username You Entered Is Already Taken , Please Try Again");
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
                                    } else {
                                        query = 'Insert into dbproject.user (Username,email,pass,gender,firstname,lastname,BirthDate) '
                                            + 'values("' + username + '","' + email + '","' + hash + '","' + gender + '","' + firstname + '","'
                                            + lastname + '","' + birthdate + '");';
                                        //Finally Inserting user
                                        DBconnection.query(query, (err, results, fields) => {
                                            if (err) return console.error(err);
                                            const getID = "select ID from dbproject.user where username='" + username + "';";
                                            DBconnection.query(getID, (err, result) => {
                                                if (err) { console.log(err); }
                                                else {
                                                    const insertTodoList = "insert into dbproject.todolist (U_ID,tasks) "
                                                        + "values(" + result[0].ID + ",'" + firstname + "`s To Do List');";
                                                    DBconnection.query(insertTodoList, (err) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                    })
                                                    req.flash("success", "You registered successfully. Please Log In");
                                                    res.redirect("/users/login");
                                                }
                                            })

                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            });
        });
    } else {
        req.flash('error', 'You are already login :)');
        res.redirect('/');
    }
});

router.get('/:username', (req, res) => {
    const errors = [];

    if (req.isAuthenticated()) {
        const query1 = "select * from dbproject.user where Username='" + req.params.username + "' ;";
        DBconnection.query(query1, (err, profileInfo) => {
            if (err) return console.error(err);
            const query2 = "select a.a_type, c.TITLE from dbproject.award as a,dbproject.competition as c "
                + " where a.userID=" + profileInfo[0].ID + " and a.competitionID=c.C_ID";
            //Second query to get the awards of user
            DBconnection.query(query2, (err, awards) => {
                if (err) return console.error(err);
                let birthDate = "-";
                //console.log(awards);
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
        const query = "select * from dbproject.user where Username='" + req.params.username + "' and ID=" + req.user.ID + " ;";
        DBconnection.query(query, (err, profileInfo) => {
            if (err) return console.error(err);
            if (profileInfo.length != 0) {
                const date = new Date(req.user.BirthDate.toString());
                const birthDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                res.render("edit-profile", {
                    title: "Edit Profile",
                    birthDate
                });
            } else {
                req.flash('error', "You can't access this page.");
                return res.redirect(`/users/${req.user.Username}`);
            }

        });
    }
    else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
});

router.post('/:username/edit-profile', (req, res) => {
    let errors = []; //all errors push should be turned into req flash
    let { firstName, lastName, username, pass, confirmPass, education, job, birthdate, gender, bio } = req.body;
    firstName = firstName.toString().replace(/'/g, "\\'");
    lastName = lastName.toString().replace(/'/g, "\\'");
    education = education.toString().replace(/'/g, "\\'");
    username = username.toString().replace(/'/g, "\\'");
    job = job.toString().replace(/'/g, "\\'");
    bio = bio.toString().replace(/'/g, "\\'");
    if (req.isAuthenticated()) {
        let query;
        let usernameChanged = false;
        //console.log(req.body);
        if (firstName !== "") {
            if (firstName.length < 50) {
                query = "update dbproject.user set firstName='" + firstName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        errors.push("Error while updating first name");
                        // req.flash("error_msg", "Error While Updating First Name");
                    }
                    //console.log(results);
                });
            } else {
                errors.push("First name is too long. It must be less than 50 characters");
                // req.flash("error_msg", "Too long String for First Name , Please Try Again");
            }
        }
        if (lastName !== "") {
            if (lastName.length < 50) {
                query = "update dbproject.user set lastName='" + lastName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        errors.push("Error While Updating Last Name");
                        // req.flash("error_msg", "Error While Updating Last Name");
                    }
                    //console.log(results);
                });
            } else {
                errors.push("Last name is too long. It must be less than 50 characters");
                // req.flash("error_msg", "Too long String for Last Name , Please Try Again");
            }
        }
        if (username !== "") {
            if (username.length < 50) {
                const pastLength = username.length;
                username = username.toString().replace(/ /g, "");
                if (username.length < pastLength) {
                    req.flash("error", "Username Can't Include Spaces");
                } else {
                    query = "update dbproject.user set Username='" + username + "' where ID=" + req.user.ID + " ;";
                    DBconnection.query(query, (err, results) => {
                        if (err) {
                            console.log(err);
                            req.flash("error", "The Username Is Already Taken");
                        } else {
                            usernameChanged = true;
                        }
                        //console.log(results);
                    });
                }
            } else {
                req.flash("error", "Username Must Contains Between 1-50 Characters, Please Try Again");
            }
        }
        if (pass !== "") {
            if (confirmPass !== "") {
                if (pass === confirmPass) {
                    if (pass.length < 500) {
                        let password = pass
                        if (password.length < 7) {
                            req.flash("error", "Password Must Contains At Least 7 Characters");
                        }
                        else {
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) return console.error(err);
                                bcrypt.hash(password, salt, (err, hash) => {
                                    if (err) return console.error(err);
                                    password = hash;
                                    query = "update dbproject.user set pass='" + hash + "' where ID=" + req.user.ID + " ;";
                                    DBconnection.query(query, (err, results, fields) => {
                                        if (err) {
                                            console.log(err);
                                            req.flash("error", "Error While Updating Password , PLease Try Agian");
                                        }
                                        //console.log(results, fields);
                                    });
                                });
                            });
                        }
                    } else {
                        req.flash("error", "Password Must Contains Between 7-500 Characters , Please Try Again");
                    }
                } else {
                    req.flash("error", "The Two Passwords You Entered Are Different");
                }
            }
        } else {
            req.flash("success", "Note Your Password Wasn't Changed");
        }
        if (education !== "") {
            if (education.length < 50) {
                query = "update dbproject.user set education='" + education + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "The Education You Entered Is Invalid");
                    }
                    //console.log(results);
                });
            } else {
                req.flash("error", "Education Must Contains Between 0-50 Characters , Please Try Again");
            }
        }
        if (job !== "") {
            if (job.length < 50) {
                query = "update dbproject.user set job='" + job + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "The Job You Entered Is Invalid");
                    }
                    //console.log(results);
                });
            } else {
                req.flash("error", "Job Must Contains Between 0-50 Characters, Please Try Again");
            }
        }
        if (bio !== "") {
            if (bio.length < 300) {
                query = "update dbproject.user set bio='" + bio + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "The Bio You Entered Is Invalid");
                    }
                    //console.log(results);
                });
            } else {
                req.flash("error", "Bio Must Contains Between 0-300 Characters , Please Try Again");
            }
        }
        if (gender !== "") {
            query = "update dbproject.user set gender='" + gender + "' where ID=" + req.user.ID + " ;";
            DBconnection.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "The Gender You Entered Is Invalid");
                }
                //console.log(results);
            });
        }
        if (birthdate != "") {
            //console.log(birthdate.slice(0, 4));
            if (birthdate.slice(0, 4) > new Date(Date.now()).getFullYear() - 8 || birthdate.slice(0, 4) < new Date(Date.now()).getFullYear() - 80) {
                req.flash('error', 'Your age must be between 8 and 80 years old');
            } else {
                query = "update dbproject,user set BirthDate='" + birthdate + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "The BirthDate You Entered Is Invalid");
                    }
                    //console.log(results);
                });
            }
        }
        req.flash("success", "Your Profile Is Updated");
        const getUsername = "select username from dbproject.user where ID=" + req.user.ID + " ;";
        DBconnection.query(getUsername, (err, getUser) => {
            if (err) { return console.log(err); }
            res.redirect("/users/" + getUser[0].username + "");
        })
    }
    else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.get("/:username/todolist", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const query = "select * from dbproject.todolist as t,dbproject.user as u "
            + " where t.U_ID=" + req.user.ID + " and u.ID=t.U_ID and u.Username='" + req.params.username + "' "
            + " order by t.deadline;";
        DBconnection.query(query, (err, rows) => {
            if (err) { return console.log(err); }
            else {
                if (rows.length != 0) {
                    rows.forEach(row => {
                        if (row.deadline)
                            row.deadline = dateFormatting.format(new Date(row.deadline));
                    })
                    res.render("todo-list", {
                        title: "To Do List",
                        username: req.params.username,
                        errors,
                        rows
                    });
                } else {
                    req.flash("error", "You Aren't Allowed To Access Other's To Do List");
                    res.redirect("/");
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post("/:username/todolist/add", (req, res) => {
    let errors = [];
    const redirectUrl = "/users/" + req.params.username + "/todolist";
    let { todoContent, todoDate } = req.body;

    if (req.isAuthenticated()) {
        let query = "";
        if (todoContent == "") {
            req.flash("error", "Please Fill In Task Content & Try Again");
            return res.redirect(redirectUrl);
        }
        var Task = todoContent.toString().replace(/'/g, "\\'");
        if (todoDate == "") {
            query = "insert into dbproject.todolist (U_ID,tasks) "
                + "values(" + req.user.ID + ",'" + Task + "')";
        } else {
            query = "insert into dbproject.todolist (U_ID,tasks,deadline) "
                + "values(" + req.user.ID + ",'" + Task + "','" + todoDate + "');";
        }
        DBconnection.query(query, (err) => {
            if (err) { console.log(err); }
            else {
                res.redirect(redirectUrl);
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post("/:username/todolist/delete/:taskid", (req, res) => {
    const redirectUrl = "/users/" + req.params.username + "/todolist";
    if (req.isAuthenticated()) {
        const query = "delete from dbproject.todolist where todoID=" + req.params.taskid + ";";
        const privacyquery = "select ID from dbproject.user where username='" + req.params.username + "';";
        DBconnection.query(privacyquery, (err, results) => {
            if (err) { console.log(err); }
            else {
                if (results.length != 0) {
                    if (results[0].ID == req.user.ID) {
                        DBconnection.query(query, (err, rows) => {
                            if (err) { console.log(err); }
                            else {
                                res.redirect(redirectUrl);
                            }
                        })
                    } else {
                        req.flash("error", "You Aren't Allowed To Access Other's To Do List");
                        res.redirect("/");
                    }
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/:username/history", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const username = req.params.username;
        const checkPrivacy = "select * from dbproject.user where ID=" + req.user.ID + " and Username='" + username + "' ;";
        const examQuery = "select * from dbproject.exam where U_ID=" + req.user.ID + " ;";
        const CompetitionQuery = 'SELECT * FROM dbproject.competition'
            + ' where U_ID=' + req.user.ID + ' AND  C_ID not in (select t.C_ID from dbproject.t_contains_cs as t) '
            + ' ORDER BY STARTDATE DESC, ENDDATE DESC;';
        const solveQuery = "select s.s_time,s.grades,e.TITLE from dbproject.solve as s,dbproject.exam as e "
            + "where s.userID=" + req.user.ID + " and e.E_ID=s.examID;";
        const participateQuery = "select l.score,c.TITLE from dbproject.leaderboard as l,dbproject.competition as c "
            + "where l.U_ID=" + req.user.ID + " and l.C_ID=c.C_ID ;";
        const participateTournament = "select t.TITLE  from dbproject.participates_in_t as p,dbproject.tournament as t "
            + "where t.T_ID=p.tournamentID and userID=" + req.user.ID + " ;";
        const tournamentQuery = "select * from dbproject.tournament where U_ID=" + req.user.ID + " ;";
        const queries = [examQuery, CompetitionQuery, solveQuery, participateQuery, tournamentQuery, participateTournament];
        function ExecuteQuery(index, queries, queryResults) {
            if (index >= 6) {
                res.render("user-history", {
                    title: "Account History",
                    errors,
                    queryResults,
                    username
                });
            }
            else {
                DBconnection.query(queries[index], (err, Results) => {
                    if (err) { return console.log(err); }
                    else {
                        if (index == 2) {
                            for (var j = 0; j < Results.length; j++) {
                                Results[j].s_time = dateFormatting.format(Results[j].s_time);
                            }
                        }
                        queryResults.push(Results);
                        ExecuteQuery(index + 1, queries, queryResults);
                    }
                })
            }
        }
        let queryResults = [];
        DBconnection.query(checkPrivacy, (err, Privacy) => {
            if (err) { return console.log(err); }
            if (Privacy.length != 0) {
                ExecuteQuery(0, queries, queryResults);
            } else {
                req.flash("error", "You aren't allowed to access this page");
                res.redirect("/");
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/:username/history/:type/:ID", (req, res) => {
    const redirectLink = "/users/" + req.params.username + "/history";
    const userquery = "select * from dbproject.user where ID=" + req.user.ID + " and Username='" + req.params.username + "' ;";
    let type = req.params.type;
    type = type.toString();
    const deleteID = req.params.ID;
    const query = "delete from dbproject." + type + " where " + type[0] + "_ID=" + deleteID + " ;";
    if (type == "Tournament") {
        //To delete the competitions in the Tournament to be deleted
        const cascadeQuery = "delete from dbproject.competition where C_ID in (select C_ID from dbproject.t_contains_cs as t where t.T_ID=" + req.params.ID + ");";
        DBconnection.query(cascadeQuery, (err) => {
            if (err) { return console.log(err); }
        })
    }
    DBconnection.query(userquery, (err, results) => {
        if (err) { return console.log(err); }
        if (results) {
            DBconnection.query(query, (err) => {
                if (err) { return console.log(err); }
                req.flash("success", type + " Is Deleted Successfully");
                res.redirect(redirectLink);
            })
        } else {
            req.flash("error", "You aren't allowed to delete items");
            res.redirect(redirectLink);
        }
    })

});

module.exports = router;