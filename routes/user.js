var express = require('express');
const router = express.Router();
const {QueryDB}=require("../db");
const bcrypt=require("bcryptjs");
const passport=require("passport");

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
        successRedirect:"/",
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
    if(!username || !email || !password || !lastname || !firstname){
        errors.push({msg:"Please Fill In All Fields"});
    }
    // //Check password match
    // if(password !==password2){
    //     errors.push({msg:"Passwords don't match"});
    // }
    //Check pass length
    if(password.length<6){
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
            QueryDB.query('Insert into dbproject.user (ID,Username,email,pass,firstname,lastname) '
            +'values(1,"'+username+'","'+email+'","'+hash+'","'+firstname+'","'+lastname+'");'
            ,(err,results,fields)=>{
                if(err){console.log(err);}
            }); 
            });
            res.send("registered succesfully");
        })
    }
})

module.exports = router;