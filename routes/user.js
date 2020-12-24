var express = require('express');
const router = express.Router();
const {QueryDB}=require("../db");
const bcrypt=require("bcryptjs");
const passport=require("passport");
const { render } = require('ejs');

router.get('/user', (req, res) => {
    const errors = [];
    QueryDB.query('SELECT * FROM dbproject.user',(err,rows)=>{
        if(err){
            throw err;
        }
        console.log(rows[0].ID);
        res.render("user-profile", {errors,rows});
    })
    
});

router.get('/login', (req, res) => {
    const errors = [];
    res.render("login", { errors });
});

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:"/users/userProfile",
        failureRedirect:"/users/login",
        failureFlash:true 
    })(req,res,next);
});

router.get('/register', (req, res) => {
    const errors = [];
    res.render("register", { errors });
});

router.post("/register",(req,res)=>{
    console.log(req.body);
    let {firstname,lastname,username,email,password}=req.body;

    let errors=[];


    //Check required fields
    if(username=="" || email=="" || password=="" || lastname=="" || firstname==""){
        errors.push({msg:"Please Fill In All Fields"});
    }
    // //Check password match
    // if(password !==password2){
    //     errors.push({msg:"Passwords don't match"});
    // }
    //Check pass length
    if(password.length<7){
        errors.push({msg:"Password should be at least 7 characters"});
    }

    //encrypting
    //ID is static so we should change it later IMPORTANT NOTE
    if(errors.length>0){
        res.render("register",{
            errors,
            email,
            password,
            username,
            firstname,
            lastname
        });
    }
    else{
        bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            if(err) {console.log(err);}      //throw error if any
            password=hash;
            QueryDB.query('Insert into dbproject.user (Username,email,pass,firstname,lastname) '
            +'values("'+username+'","'+email+'","'+hash+'","'+firstname+'","'+lastname+'");'
            ,(err,results,fields)=>{
                if(err){console.log(err);}
            }); 
            });
            res.redirect("/users/login");
        })
    }
})
router.get('/userProfile', (req, res) => {
    const errors = [];

    if(req.isAuthenticated()){
        const query="select * from dbproject.user where ID="+req.user.ID+" ;";
        const query2="select a.type,c.TITLE from dbproject.award as a,dbproject.cometition as c "
                        +"where a.userID="+req.user.ID+" and a.competitionID=c.C_ID";
        QueryDB.query(query,(err,profileInfo)=>{
            if(err){
                console.log(err);
            }
            else{
                //Second query to get the awards of user
                QueryDB.query(query2,(err,awards)=>{
                    if(err){
                        console.log(err);
                    }else{
                        //console.log(awards);
                        var birthDate="-";
                        if(profileInfo[0].BirthDate){
                            birthDate=profileInfo[0].BirthDate.toString().slice(0,16);
                        }
                        
                        res.render("user-profile", { errors,profileInfo,birthDate,awards });
                    }
                })
            }
        })
    }
    else{
        errors.push({msg:"Please Login First"});
        res.render("login",{errors});
    }
    
});

router.get('/userProfile/edit', (req, res) => {
    const errors = [];

    if(req.isAuthenticated()){
        const query="select * from dbproject.user where ID="+req.user.ID+" ;";
        QueryDB.query(query,(err,profileInfo)=>{
            if(err){console.log(err);}
            else{
                res.render("edit-profile",{errors,profileInfo});
            }
        })
    }
    else{
        errors.push({msg:"Please Login First"});
        res.render("login",{errors});
    }
    
});

router.post('/userProfile/edit', (req, res) => {
    const errors = []; //all errors push should be turned into req flash

    if(req.isAuthenticated()){
        let query;
        //console.log(req.body);
        if(req.body.firstName!=""){
            if(req.body.firstName.length<50){
                query="update user set firstName='"+req.body.firstName+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","Error While Updating First Name");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for First Name , Please Try Again");
            }
        }
        if(req.body.lastName!=""){
            if(req.body.lastName.length<50){
                query="update user set lastName='"+req.body.lastName+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","Error While Updating Last Name");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for Last Name , Please Try Again");
            }
        }
        if(req.body.username!=""){
            if(req.body.username.length<50){
                query="update user set Username='"+req.body.username+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","The Username Is Already Taken");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for Username , Please Try Again");
            }
        }
        if(req.body.pass!=""){
            if(req.body.confirmPass!=""){
                if(req.body.pass==req.body.confirmPass){
                    if(req.body.pass.length<500){
                        var password=req.body.pass
                        if(password.length<7){
                            req.flash("error_msg","Password Must Contains At Least 7 Characters");
                        }
                        else{
                            bcrypt.genSalt(10,(err,salt)=>{
                                bcrypt.hash(password,salt,(err,hash)=>{
                                        if(err) {console.log(err);}      //throw error if any
                                        password=hash;
                                        query="update user set pass='"+hash+"' where ID="+req.user.ID+" ;";
                                        QueryDB.query(query,(err,results,fields)=>{
                                            if(err){
                                                console.log(err);
                                                req.flash("error_msg","Error While Updating Password , PLease Try Agian");
                                            }
                                        });
                                    });
                                })
                        }
                    }else{
                        req.flash("error_msg","Too long String for Password , Please Try Again");
                    }
                }else{
                    req.flash("error_msg","The Two Passwords You Entered Are Different");
                }
            }
        }else{
            req.flash("success_msg","Note Your Password Wasn't Changed");
        }
        if(req.body.education!=""){
            if(req.body.username.length<50){
                query="update user set education='"+req.body.education+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","The Education You Entered Is Invalid");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for Education , Please Try Again");
            }
        }
        if(req.body.job!=""){
            if(req.body.username.length<50){
                query="update user set job='"+req.body.job+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","The Job You Entered Is Invalid");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for Job , Please Try Again");
            }
        }
        if(req.body.bio!=""){
            if(req.body.username.length<300){
                query="update user set bio='"+req.body.bio+"' where ID="+req.user.ID+" ;";
                QueryDB.query(query,(err,results)=>{
                    if(err){
                        console.log(err);
                        req.flash("error_msg","The Bio You Entered Is Invalid");
                    }
                })
            }else{
                req.flash("error_msg","Too long String for Bio , Please Try Again");
            }
        }
        if(req.body.gender!=""){
            query="update user set gender='"+req.body.gender+"' where ID="+req.user.ID+" ;";
            QueryDB.query(query,(err,results)=>{
                if(err){
                    console.log(err);
                    req.flash("error_msg","The Gender You Entered Is Invalid");
                }
            })
        }
        if(req.body.date!=""){
            query="update user set BirthDate='"+req.body.date+"' where ID="+req.user.ID+" ;";
            QueryDB.query(query,(err,results)=>{
                if(err){
                    console.log(err);
                    req.flash("error_msg","The BirthDate You Entered Is Invalid");
                }
            })
        }
        req.flash("success_msg","Your Profile Is Updated");
        res.redirect("/users/userProfile/edit");
    }
    else{
        errors.push({msg:"Please Login First"});
        res.render("login",{errors});
    }
    
});

router.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success_msg","You are logged out");
    res.redirect("/users/login");
})

module.exports = router;