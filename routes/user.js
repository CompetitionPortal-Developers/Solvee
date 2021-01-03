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

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You are logged out");
    res.redirect("/users/login");
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
    let { firstname, lastname, username, email, password, gender, birthdate } = req.body;

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
                                        const getID="select ID from dbproject.user where username='"+username+"';";
                                        DBconnection.query(getID,(err,result)=>{
                                            if(err){console.log(err);}
                                            else{
                                                const insertTodoList="insert into dbproject.todolist (U_ID,tasks) "
                                                +"values("+result[0].ID+",'"+firstname+"`s To Do List');";
                                                DBconnection.query(insertTodoList,(err)=>{
                                                    if(err){
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
            const date = new Date(req.user.BirthDate.toString());
            const birthDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            res.render("edit-profile", {
                title: "Edit Profile",
                birthDate
            });
        });
    }
    else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
});

router.post('/:username/edit-profile', (req, res) => {
    const errors = []; //all errors push should be turned into req flash
    const { firstName, lastName, username, pass, confirmPass, education, job, birthdate, gender, bio } = req.body;
    if (req.isAuthenticated()) {
        let query;
        console.log(req.body);
        if (firstName !== "") {
            if (firstName.length < 50) {
                query = "update user set firstName='" + firstName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        errors.push("Error while updating first name");
                        // req.flash("error_msg", "Error While Updating First Name");
                    }
                    console.log(results);
                });
            } else {
                errors.push("First name is too long. It must be less than 50 characters");
                // req.flash("error_msg", "Too long String for First Name , Please Try Again");
            }
        }
        if (lastName !== "") {
            if (lastName.length < 50) {
                query = "update user set lastName='" + lastName + "' where ID=" + req.user.ID + " ;";
                DBconnection.query(query, (err, results) => {
                    if (err) {
                        console.log(err);
                        errors.push("Error While Updating Last Name");
                        // req.flash("error_msg", "Error While Updating Last Name");
                    }
                    console.log(results);
                });
            } else {
                errors.push("Last name is too long. It must be less than 50 characters");
                // req.flash("error_msg", "Too long String for Last Name , Please Try Again");
            }
        }
        if (username !== "") {
            if (username.length < 50) {
                query = "update user set Username='" + username + "' where ID=" + req.user.ID + " ;";
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
        if (pass !== "") {
            if (confirmPass !== "") {
                if (pass === confirmPass) {
                    if (pass.length < 500) {
                        let password = pass
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
            req.flash("success", "Note Your Password Wasn't Changed");
        }
        if (education !== "") {
            if (username.length < 50) {
                query = "update user set education='" + education + "' where ID=" + req.user.ID + " ;";
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
        if (job !== "") {
            if (username.length < 50) {
                query = "update user set job='" + job + "' where ID=" + req.user.ID + " ;";
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
        if (bio !== "") {
            if (username.length < 300) {
                query = "update user set bio='" + bio + "' where ID=" + req.user.ID + " ;";
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
        if (gender !== "") {
            query = "update user set gender='" + gender + "' where ID=" + req.user.ID + " ;";
            DBconnection.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    req.flash("error_msg", "The Gender You Entered Is Invalid");
                }
                console.log(results);
            });
        }
        if (birthdate != "") {
            query = "update user set BirthDate='" + birthdate + "' where ID=" + req.user.ID + " ;";
            DBconnection.query(query, (err, results) => {
                if (err) {
                    console.log(err);
                    req.flash("error_msg", "The BirthDate You Entered Is Invalid");
                }
                console.log(results);
            });
        }
        req.flash("success", "Your Profile Is Updated");
        res.redirect(`/users/${req.params.username}`);
    }
    else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.get("/:username/todolist",(req,res)=>{
    let errors=[];
    if(req.isAuthenticated()){
        const privacyquery="select ID from dbproject.user where username='"+req.params.username+"';";
        const query="select * from dbproject.todolist where U_ID="+req.user.ID+";";
        DBconnection.query(privacyquery,(err,results)=>{
            if(err){console.log(err);}
            else{
                if(results[0].ID==req.user.ID){
                    DBconnection.query(query,(err,rows)=>{
                        if(err){ return console.log(err);}
                        else{
                            res.render("todo-list",{
                                title:"To Do List",
                                username:req.params.username,
                                errors,
                                rows
                            });
                        }
                    })
                }else{
                    req.flash("error", "You Aren't Allowed To Access Other's To Do List");
                    res.redirect("/");
                }
            }
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post("/:username/todolist/add",(req,res)=>{
    let errors=[];
    const redirectUrl="/users/"+req.params.username+"/todolist";
    let {todoContent,todoDate}=req.body;
    if(req.isAuthenticated()){
        var Task=todoContent.toString().replace(/'/g,"");
        console.log(Task);
        let query="";
        if(todoContent==""){
            req.flash("error", "Please Fill In Task Content & Try Again");
            return res.redirect(redirectUrl);
        }
        if(todoDate==""){
            query="insert into dbproject.todolist (U_ID,tasks) "
                        +"values("+req.user.ID+",'"+Task+"')";
        }else{
            query="insert into dbproject.todolist (U_ID,tasks,deadline) "
                    +"values("+req.user.ID+",'"+Task+"','"+todoDate+"');";
        }
        DBconnection.query(query,(err)=>{
            if(err){console.log(err);}
            else{
                req.flash("success", "The Task Is Added Successfully");
                res.redirect(redirectUrl);
            }
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post("/:username/todolist/delete/:taskid",(req,res)=>{
    const redirectUrl="/users/"+req.params.username+"/todolist";
    if(req.isAuthenticated()){
        const query="delete from dbproject.todolist where todoID="+req.params.taskid+";";
        const privacyquery="select ID from dbproject.user where username='"+req.params.username+"';";
        DBconnection.query(privacyquery,(err,results)=>{
            if(err){console.log(err);}
            else{
                if(results[0].ID==req.user.ID){
                    DBconnection.query(query,(err,rows)=>{
                        if(err){ console.log(err);}
                        else{
                            req.flash("success", "The Task Is Deleted Successfully");
                            res.redirect(redirectUrl);
                        }
                    })
                }else{
                    req.flash("error", "You Aren't Allowed To Access Other's To Do List");
                    res.redirect("/");
                }
            }
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

module.exports = router;