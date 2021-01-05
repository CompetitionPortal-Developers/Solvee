const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const { render } = require("ejs");
const { DBconnection } = require("../config/database");
const dateFormat = require("../config/date-formatting");

router.get('/', (req, res) => {
    const errors = [];

    DBconnection.query('SELECT * FROM dbproject.competition ORDER BY STARTDATE DESC, ENDDATE DESC;', (err, rows) => {
        if (err) return console.error(err);
        const competitions = rows;
        if (competitions.length)
            competitions.forEach(competition => {
                competition.STARTDATE = dateFormat.format(competition.STARTDATE);
                competition.ENDDATE = dateFormat.format(competition.ENDDATE);
            });
        res.render('competitions', {
            title: "Competitions",
            competitions,
            errors
        });
    });
});

router.get('/details/:c_id', (req, res) => {
    const errors = [];

    DBconnection.query(`SELECT * FROM dbproject.competition WHERE C_ID=${req.params.c_id}`, (err, rows) => {
        if (err) return console.error(err);
        if (!rows.length) return res.sendStatus(404);
        const competition = rows[0];
        competition.STARTDATE = dateFormat.format(competition.STARTDATE);
        competition.ENDDATE = dateFormat.format(competition.ENDDATE);
        DBconnection.query(`SELECT firstName, lastName FROM dbproject.user WHERE ID=${competition.U_ID}`, (err, [user]) => {
            res.render("competition-details", {
                title: competition.TITLE,
                competition,
                host: user,
                errors
            });
        });
    });
});

// /details/:c_id/leaderboard
router.get('/leaderboard/:c_id/:comp_name/', (req, res) => {
    const errors = [];
    const query="select u.Username,l.grade,l.duration,l.score from dbproject.leaderboard as l,dbproject.user as u "
                +" where C_ID="+req.params.c_id+" and "+"u.ID=l.U_ID ";
    const comp_ID=req.params.c_id;
    const comp_TITLE=req.params.comp_name;
    DBconnection.query(query,(err,List)=>{
        if(err){
            return console.log(err);
        }else{
            console.log(List);
            List.sort((a, b) => {
                return b.score - a.score;
            });
            res.render("leaderboard",{
                title:"leaderboard",
                errors,
                comp_ID,
                comp_TITLE,
                List
            });
        }
    })
});

router.get('/questions/:c_id', (req, res) => {
    if (req.isAuthenticated()) {
        const errors = [];

        DBconnection.query(`SELECT * FROM dbproject.competition WHERE C_ID=${req.params.c_id}`, (err, competition) => {
            if (err) return console.error(err);
            if (!competition.length) return res.sendStatus(404);
            competition = competition[0];
            if (Date.now() < competition.STARTDATE) {
                req.flash("error", "This competition hasn't started yet.");
                res.redirect('back');
            } else if (Date.now() > competition.ENDDATE) {
                req.flash("error", "This competition has already finished");
                res.redirect('back');
            } else if (competition.U_ID === req.user.ID) {
                req.flash('error', 'You can\'t participate in this comeptition as you are the host of it.');
                res.redirect('back');
            } else {
                DBconnection.query(`SELECT * FROM dbproject.QUESTIONS WHERE c_id=${req.params.c_id}`, (err, questions) => {
                    if (err) return console.error(err);
                    DBconnection.query(`SELECT s_time FROM dbproject.participate WHERE userID=${req.user.ID} AND competitionID=${competition.C_ID};`, (err, rows) => {
                        if (err) return console.error(err);
                        if (rows.length) {
                            req.flash('error', 'You already participated in this competition.');
                            return res.redirect(`/competitions/reviews/${competition.C_ID}`);
                        }
                        const query = `INSERT INTO dbproject.participate (userID, competitionID) VALUES (${req.user.ID}, ${competition.C_ID});`;
                        DBconnection.query(query, (err, results, fields) => {
                            if (err) return console.error(err);
                            res.render("competition-questions", {
                                title: competition.TITLE,
                                competition,
                                questions,
                                errors
                            });
                        });
                    });
                });
            }
        });
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
});

router.post('/questions/:c_id', (req, res) => {
    if (req.isAuthenticated()) {
        const errors = [];

        DBconnection.query(`SELECT * FROM dbproject.competition WHERE C_ID=${req.params.c_id}`, (err, competition) => {
            if (err) return console.error(err);
            if (!competition.length) return res.sendStatus(404);
            competition = competition[0];
            if (Date.now() < competition.STARTDATE) {
                req.flash("error", "This competition hasn't started yet.");
                res.redirect('back');
            } else if (Date.now() > competition.ENDDATE) {
                req.flash("error", "This competition has already finished");
                res.redirect('back');
            } else {
                DBconnection.query(`SELECT * FROM dbproject.QUESTIONS WHERE c_id=${req.params.c_id}`, (err, questions) => {
                    if (err) return console.error(err);
                    const userAnswers = req.body;
                    let grade = 0;
                    questions.forEach((question, index) => {
                        if (!userAnswers[`q${index + 1}`])
                            userAnswers[`q${index + 1}`] = "Null";
                        if (userAnswers[`q${index + 1}`] === question.CHOICE_1)
                            grade++;
                    });
                    DBconnection.query(`SELECT s_time FROM dbproject.participate WHERE userID=${req.user.ID} AND competitionID=${competition.C_ID};`, (err, [{ s_time }]) => {
                        if (err) return console.error(err);
                        const duration = Math.abs(Date.now() - s_time) / (1000 * 60);
                        const score = Math.round(((grade / duration) + Number.EPSILON) * 100) / 100;
                        const insertToLB = `INSERT INTO dbproject.leaderboard VALUES (${req.user.ID}, ${competition.C_ID}, ${grade}, ${duration}, ${score});`;
                        DBconnection.query(insertToLB, err => {
                            if (err) return console.error(err);
                            req.flash('success', 'Your answers are submitted!');
                            res.redirect(`/competitions/reviews/${competition.C_ID}`);
                        });
                    });
                });
            }
        });
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
});

router.get('/reviews/:c_id', (req, res) => {
    const errors = [];

    DBconnection.query(`SELECT * FROM dbproject.competition WHERE C_ID=${req.params.c_id}`, (err, competition) => {
        if (err) return console.error(err);
        if (!competition.length) return res.sendStatus(404);
        competition = competition[0];
        if (Date.now() < competition.STARTDATE) {
            req.flash("error", "This competition hasn't started yet.");
            res.redirect(`/competitions/details/${competition.C_ID}`);
        } else if (Date.now() > competition.ENDDATE) {
            req.flash("error", "This competition has already finished");
            res.redirect(`/competitions/details/${competition.C_ID}`);
        } else {
            res.redirect(`/competitions/details/${competition.C_ID}`);
            // DBconnection.query(`SELECT * FROM dbproject.REVIEWS WHERE c_id=${req.params.c_id}`, (err, reviews) => {
            //     if (err) return console.error(err);
            //     res.render("competition-reviews", {
            //         title: competition.TITLE,
            //         competition,
            //         reviews,
            //         errors
            //     });
            // });
        }
    });
});

router.get('/CreateCompetition', (req, res) => {
    if (req.isAuthenticated()) {
        const errors = [];
        res.render("create-competition", {
            title: "Competition Creation",
            errors
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.post('/:username/CreateCompetition', [
    body('competitionTitle', 'Competition Title must be between 2 and 50 characters long').isLength({
        min: 2,
        max: 50
    }),
    body('description', 'Description must be between 0 and 500 characters long').isLength({
        min: 0,
        max: 500
    }),
    body('questionNumber', 'Question Number must be selected').notEmpty(),
    body('startDate', 'Start Date must be selected').notEmpty(),
    body('endDate', 'End Date must be selected').notEmpty(),
], (req, res) => {
    if (req.isAuthenticated()) {
        let errors = validationResult(req).errors;
        let {
            competitionTitle,
            category,
            questionNumber,
            startDate,
            endDate,
            description
        } = req.body;

        if (competitionTitle == "" || category == "" || startDate == "" || endDate == "" || description == "") {
            errors.unshift({
                msg: "Please Fill In All Fields"
            });
        }

        if (errors.length) {
            return res.render("create-competition", {
                title: "Competition Creation",
                errors,
                competitionTitle,
                category,
                questionNumber,
                startDate,
                endDate,
                description
            });
        }

        const query = "INSERT INTO dbproject.competition (TITLE,CATEGORY,DESCP,STARTDATE,ENDDATE,Qnum,U_ID) " +
            "VALUES('" + competitionTitle + "','" + category + "','" + description + "','" + startDate + "','" + endDate + "'," + questionNumber + "," + req.user.ID + ");";
        DBconnection.query(query, (err, rows) => {
            if (err) {
                console.log(err);
                req.flash("error", "Something Went Wrong Creating The Competition , Please Try Again Later");
                return res.render("create-competition", {
                    title: "Cometition Creation",
                    errors,
                    competitionTitle,
                    category,
                    questionNumber,
                    startDate,
                    endDate,
                    description
                });
            } else {
                res.render("Cquestions-entry", {
                    title: "Questions Entry",
                    errors,
                    questionNumber,
                    competitionTitle
                })
            }
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.get("/:username/CreateCompetition/:Qnum/:Ctitle", (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];
        const questionNumber = req.params.Qnum;
        const competitionTitle = req.params.Ctitle;
        res.render("Cquestions-entry", {
            title: "Questions Entry",
            errors,
            questionNumber,
            competitionTitle
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.post('/:username/CreateCompetition/:Qnum/:Ctitle', (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];

        const redirectLink = "/competitions/" + req.user.Username + "/CreateCompetition/" + req.params.Qnum + "/" + req.params.Ctitle;
        const obj = req.body;
        let items = [];
        for (const name in obj) {
            console.log(obj[name]);
            items.push(obj[name]);
        }
        //Checking for empty questions
        for (let i = 0; i < items.length; i++) {
            // console.log("items: "+items[i]);
            if (items[i] == "") {
                req.flash("error", "Please Fill In All Fields & Try Again");
                return res.redirect(redirectLink);
            }
        }
        const counter = 4;
        let j = 0;

        function InsertQ(num, Title) {
            if (num * 5 < items.length) {
                console.log(items[0]);
                console.log(num);
                console.log(Title);
                let queryInsert = "insert into dbproject.questions (c_id,QUESTION,CHOICE_1,CHOICE_2,CHOICE_3,CHOICE_4) " +
                    "values(" + Title + ",'" + items[num + counter * num] + "','" + items[num + 1 + counter * num] + "','" + items[num + 2 + counter * num] + "','" + items[num + 3 + counter * num] + "','" + items[num + 4 + counter * num] + "');";
                console.log(queryInsert);
                DBconnection.query(queryInsert, (err, rows) => {
                    if (err) {
                        console.log(err);
                    } else {
                        j++;
                        InsertQ(j, Title);
                    }
                });
            } else {
                return;
            }
        }

        //inserting questions
        let queryGetComptetion = "select C_ID from dbproject.competition where TITLE='" + req.params.Ctitle + "';";
        console.log(queryGetComptetion);
        DBconnection.query(queryGetComptetion, (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                InsertQ(j, rows[0].C_ID);
            }
        });

        //rendering congrats page
        res.redirect("/competitions/CompetitionCreated/" + req.params.Ctitle);
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

router.get("/CompetitionCreated/:Ctitle", (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];
        let queryGetComptetion = "select C_ID from dbproject.competition where TITLE='" + req.params.Ctitle + "';";

        DBconnection.query(queryGetComptetion, (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                let code = rows[0].C_ID;
                res.render("Ccompetition-success", {
                    title: "Competition Created",
                    errors,
                    code
                });
            }
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
});

module.exports = router;