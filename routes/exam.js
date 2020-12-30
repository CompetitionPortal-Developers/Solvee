const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const { render } = require("ejs");
const { DBconnection } = require("../config/database");
const dateFormat = require("../config/date-formatting");

router.get('/', (req, res) => {
    const errors = [];

    DBconnection.query('SELECT * FROM dbproject.exam;', (err, rows) => {
        if (err) return console.error(err);
        const exams = rows;
        if (exams.length)
            exams.forEach(exam => {
                exams.STARTDATE = dateFormat(exam.STARTDATE);
                exams.ENDDATE = dateFormat(exam.ENDDATE);
            });
        res.render('exams', {
            title: "Exams",
            exams,
            errors
        });
    });
});


//If the user pressed discard the exam creation
router.get('/CreateExam',(req,res)=>{
    const errors=[];
    if(req.isAuthenticated()){
        res.render("create-exam",{
            title:"Exam Creation",
            errors
        });
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post('/:username/CreateExam',[
    body('examTitle', 'exam Title must be between 2 and 50 characters long').isLength({ min: 2, max: 50 }),
    body('description', 'Description must be between 0 and 500 characters long').isLength({ min: 0, max: 500 }),
    body('questionNumber', 'Question Number must be selected').notEmpty(),
    body('startDate', 'Start Date must be selected').notEmpty(),
    body('endDate', 'End Date must be selected').notEmpty(),
    body('duration', 'duration must be entered').notEmpty(),
],(req,res)=>{

    if(req.isAuthenticated()){
        let errors = validationResult(req).errors;
        let {examTitle,category,questionNumber,startDate,endDate,duration,description}=req.body;

        if(examTitle=="" || category=="" || startDate=="" || endDate=="" || description=="" || duration==""){
            errors.unshift({ msg: "Please Fill In All Fields" });
        }

        if (errors.length){
            return res.render("create-exam", {
                title: "Exam Creation",
                errors,
                examTitle,
                category,
                questionNumber,
                startDate,
                endDate,
                duration,
                description
            });
        }

        const query="INSERT INTO dbproject.exam (TITLE,CATEGORY,DESCP,STARTDATE,ENDDATE,DURATION,Qnum,U_ID) "
        +"VALUES('"+examTitle+"','"+category+"','"+description+"','"+startDate+"','"+endDate+"',"+duration+","+questionNumber+","+req.user.ID+");";
        DBconnection.query(query,(err,rows)=>{
            if(err){
                console.log(err);
                req.flash("error", "Something Went Wrong Creating The Exam , Please Try Again Later");
                return res.render("register", {
                    title: "Register",
                    errors,
                    examTitle,
                    category,
                    questionNumber,
                    startDate,
                    endDate,
                    duration,
                    description
                });
            }else{
                res.render("Equestions-entry",{
                    title:"Questions Entry",
                    errors,
                    questionNumber,
                    examTitle
                })
            }
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/:username/CreateExam/:Qnum/:Etitle",(req,res)=>{
    if(req.isAuthenticated()){
        let errors=[];
        const questionNumber=req.params.Qnum;
        const examTitle=req.params.Etitle;
        res.render("Equestions-entry",{
            title:"Questions Entry",
            errors,
            questionNumber,
            examTitle
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post('/:username/CreateExam/:Qnum/:Etitle',(req,res)=>{
    if(req.isAuthenticated()){
        let errors=[];

        const redirectLink="/exams/"+req.user.Username+"/CreateExam/"+req.params.Qnum+"/"+req.params.Etitle;
        const obj=req.body;
        let items=[];
        for(const name in obj){
            console.log(obj[name]);
            items.push(obj[name]);
        }
        //Checking for empty questions
        for(var i=0;i<items.length;i++){
            // console.log("items: "+items[i]);
            if(items[i]==""){
                req.flash("error", "Please Fill In All Fields & Try Again");
                return res.redirect(redirectLink);
            }
        }
        const counter=4;
        let j=0;

        function InsertQ(num,Title) {
            if(num*5<items.length){
                console.log(items[0]);
                console.log(num);
                console.log(Title);
                let queryInsert="insert into dbproject.questions (e_id,QUESTION,CHOICE_1,CHOICE_2,CHOICE_3,CHOICE_4) "
                                +"values("+Title+",'"+items[num+counter*num]+"','"+items[num+1+counter*num]+"','"+items[num+2+counter*num]+"','"+items[num+3+counter*num]+"','"+items[num+4+counter*num]+"');";
                console.log(queryInsert);
                DBconnection.query(queryInsert,(err,rows)=>{
                    if(err){console.log(err);}
                    else{
                        j++;
                        InsertQ(j,Title);
                    }
                })
            }else{
                return;
            }
        }

        //inserting questions
        let queryGetexam="select E_ID from dbproject.exam where TITLE='"+req.params.Etitle+"';";
        console.log(queryGetexam);
        DBconnection.query(queryGetexam,(err,rows)=>{
            if(err){console.log(err);}
            else{
                    InsertQ(j,rows[0].E_ID);
            }
        })

        //rendering congrats page
        res.redirect("/exams/ExamCreated/"+req.params.Etitle);
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/ExamCreated/:Etitle",(req,res)=>{
    if(req.isAuthenticated()){
        let errors=[];
        let queryGetExam="select E_ID from dbproject.exam where TITLE='"+req.params.Etitle+"';";

        DBconnection.query(queryGetExam,(err,rows)=>{
            if(err){console.log(err);}
            else{
                let code=rows[0].E_ID;
                res.render("examC-success",{
                    title:"Exam Created",
                    errors,
                    code
                })
            }
        })
    }else{
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})



module.exports = router;