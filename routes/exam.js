const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const { DBconnection } = require("../config/database");
const dateFormat = require("../config/date-formatting");

router.get('/', (req, res) => {
    const errors = [];

    DBconnection.query('SELECT * FROM dbproject.exam;', (err, rows) => {
        if (err) return console.error(err);
        const exams = rows;
        if (exams.length)
            exams.forEach(exam => exam.STARTDATE = dateFormat.format(exam.STARTDATE));
        res.render('exams', {
            title: "Exams",
            exams,
            errors
        });
    });
});


//If the user pressed discard the exam creation
router.get('/CreateExam', (req, res) => {
    const errors = [];
    if (req.isAuthenticated()) {
        res.render("create-exam", {
            title: "Exam Creation",
            errors
        });
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post('/:username/CreateExam', [
    body('examTitle', 'exam Title must be between 2 and 50 characters long').isLength({ min: 2, max: 50 }),
    body('description', 'Description must be between 0 and 500 characters long').isLength({ min: 0, max: 500 }),
    body('questionNumber', 'Question Number must be selected').notEmpty(),
    body('startDate', 'Start Date must be selected').notEmpty(),
    body('duration', 'duration must be entered').notEmpty(),
], (req, res) => {

    if (req.isAuthenticated()) {
        let errors = validationResult(req).errors;
        let { examTitle, category, questionNumber, startDate, duration, description } = req.body;

        if (examTitle == "" || category == "" || startDate == "" || description == "" || duration == "") {
            errors.unshift({ msg: "Please Fill In All Fields" });
        }

        if (errors.length) {
            return res.render("create-exam", {
                title: "Exam Creation",
                errors,
                examTitle,
                category,
                questionNumber,
                startDate,
                duration,
                description
            });
        }

        var add_minutes = function (dt, minutes) {
            return new Date(dt.getTime() + minutes * 60000);
        }
        startDate = new Date(startDate.toString());
        let endDate = add_minutes(startDate, duration);
        examTitle = examTitle.toString().replace(/'/g, "");
        description = description.toString().replace(/'/g, "");
        category = category.toString().replace(/'/g, "");

        function Compare(startDate) {
            sDate = new Date(startDate.toString());
            var Result = true;
            var today = new Date();
            if (sDate.getDate() < today.getDate()) {
                Result = false;
            } else {
                if (sDate.getDate() == today.getDate()) {
                    if (sDate.getTime() < today.getTime()) {
                        Result = false;
                    }
                }
            }
            return Result;
        }

        //Date Validation
        if (!Compare(startDate)) {
            req.flash("error", "Make Sure That Start Date Isn't Older Than Current Date");
            return res.redirect("/exams/CreateExam");
        }
        startDate = dateFormat.DBformat(startDate);
        endDate = dateFormat.DBformat(endDate);

        const query = "INSERT INTO dbproject.exam (TITLE,CATEGORY,DESCP,STARTDATE,DURATION,Qnum,U_ID) "
            + "VALUES('" + examTitle + "','" + category + "','" + description + "','" + startDate + "'," + duration + "," + questionNumber + "," + req.user.ID + ");";
        DBconnection.query(query, (err, rows) => {
            if (err) {
                console.log(err);
                req.flash("error", "Something Went Wrong Creating The Exam , Please Try Again Later");
                return res.redirect("/exams");
            } else {
                res.render("Equestions-entry", {
                    title: "Questions Entry",
                    errors,
                    questionNumber,
                    examTitle
                })
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/:username/CreateExam/:Qnum/:Etitle", (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];
        const questionNumber = req.params.Qnum;
        const examTitle = req.params.Etitle;
        res.render("Equestions-entry", {
            title: "Questions Entry",
            errors,
            questionNumber,
            examTitle
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post('/:username/CreateExam/:Qnum/:Etitle', (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];

        const redirectLink = "/exams/" + req.user.Username + "/CreateExam/" + req.params.Qnum + "/" + req.params.Etitle;
        const obj = req.body;
        let items = [];
        for (const name in obj) {
            console.log(obj[name]);
            items.push(obj[name]);
        }
        //Checking for empty questions
        for (var i = 0; i < items.length; i++) {
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
                let queryInsert = "insert into dbproject.questions (e_id,QUESTION,CHOICE_1,CHOICE_2,CHOICE_3,CHOICE_4) "
                    + "values(" + Title + ",'" + items[num + counter * num] + "','" + items[num + 1 + counter * num] + "','" + items[num + 2 + counter * num] + "','" + items[num + 3 + counter * num] + "','" + items[num + 4 + counter * num] + "');";
                console.log(queryInsert);
                DBconnection.query(queryInsert, (err, rows) => {
                    if (err) { console.log(err); }
                    else {
                        j++;
                        InsertQ(j, Title);
                    }
                })
            } else {
                return;
            }
        }

        //inserting questions
        let queryGetexam = "select E_ID from dbproject.exam where TITLE='" + req.params.Etitle + "';";
        console.log(queryGetexam);
        DBconnection.query(queryGetexam, (err, rows) => {
            if (err) { console.log(err); }
            else {
                InsertQ(j, rows[0].E_ID);
            }
        })

        //rendering congrats page
        res.redirect("/exams/ExamCreated/" + req.params.Etitle);
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/ExamCreated/:Etitle", (req, res) => {
    if (req.isAuthenticated()) {
        let errors = [];
        let queryGetExam = "select E_ID from dbproject.exam where TITLE='" + req.params.Etitle + "';";

        DBconnection.query(queryGetExam, (err, rows) => {
            if (err) { console.log(err); }
            else {
                let code = rows[0].E_ID;
                code *= 3;
                code = "X" + code + "Solvee";
                codeQuery = "UPDATE dbproject.exam set code='" + code + "' where E_ID=" + rows[0].E_ID + " ;";
                const examID = rows[0].E_ID;
                console.log(code);
                DBconnection.query(codeQuery, (err) => {
                    if (err) {
                        return console.log(err);
                    } else {
                        res.render("examC-success", {
                            title: "Exam Created",
                            errors,
                            code,
                            examID
                        })
                    }
                })
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.post("/details/:E_ID", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const { code } = req.body;
        const query = "select * from dbproject.exam where E_ID=" + req.params.E_ID + ";";
        DBconnection.query(query, (err, exam) => {
            if (err) { return console.log(err); }
            else {
                if (exam[0].CODE == code) {
                    res.redirect("/exams/details/" + req.params.E_ID + "/" + code);
                } else {
                    req.flash("error", "Incorrect Code , Can't Access The Exam");
                    res.redirect("/exams");
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})

router.get("/details/:E_ID/:Code", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const query = "select * from dbproject.exam where E_ID=" + req.params.E_ID + ";";
        DBconnection.query(query, (err, exam) => {
            if (err) { return console.log(err); }
            if (!exam.length) return res.sendStatus(404);
            else {
                if (exam[0].CODE == req.params.Code) {
                    const queryUser = "select * from dbproject.user where ID=" + exam[0].U_ID + ";";
                    DBconnection.query(queryUser, (err, host) => {
                        if (err) { return console.log(err); }
                        else {
                            const examCode = req.params.Code;
                            exam = exam[0];
                            exam.STARTDATE = dateFormat.format(exam.STARTDATE);
                            host = host[0];
                            res.render("exam-details", {
                                title: "Exam details",
                                errors,
                                exam,
                                host,
                                examCode
                            })
                        }
                    })
                } else {
                    req.flash("error", "Incorrect Code , Can't Access The Exam");
                    res.redirect("/exams");
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/users/login");
    }
})


router.get('/questions/:e_id/:Code', (req, res) => {
    const errors = [];
    if (req.isAuthenticated()) {

        const redirectLink = "/exams/details/" + req.params.e_id + "/" + req.params.Code + "";
        DBconnection.query(`SELECT * FROM dbproject.exam WHERE E_ID=${req.params.e_id}`, (err, exam) => {
            if (err) return console.error(err);
            if (!exam.length) return res.sendStatus(404);
            exam = exam[0];
            if (Date.now() < exam.STARTDATE) {
                req.flash("error", "This exam hasn't started yet.");
                res.redirect(redirectLink);
            } else if (Date.now() > (new Date(exam.STARTDATE).getTime() + exam.DURATION * 60 * 1000)) {
                req.flash("error", "This exam has already finished");
                res.redirect(redirectLink);
            } else if (exam.U_ID === req.user.ID) {
                req.flash('error', 'You can\'t solve this exam as you are the creator of it.');
                res.redirect(redirectLink);
            } else {
                DBconnection.query(`SELECT * FROM dbproject.QUESTIONS WHERE e_id=${req.params.e_id}`, (err, questions) => {
                    if (err) return console.error(err);
                    DBconnection.query(`SELECT s_time FROM dbproject.solve WHERE userID=${req.user.ID} AND examID=${exam.E_ID};`, (err, rows) => {
                        if (err) return console.error(err);
                        if (rows.length) {
                            req.flash('error', 'You already solved this exam.');
                            return res.redirect(redirectLink);
                        }
                        let currentDate = new Date();
                        currentDate = dateFormat.DBformat(currentDate);
                        const query = `INSERT INTO dbproject.solve (userID, examID,s_time) VALUES (${req.user.ID}, ${exam.E_ID},'${currentDate}');`;
                        DBconnection.query(query, (err, results, fields) => {
                            if (err) return console.error(err);
                            res.render("exam-questions", {
                                title: exam.TITLE,
                                exam,
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

router.post('/questions/:e_id', (req, res) => {
    if (req.isAuthenticated()) {
        const errors = [];
        DBconnection.query(`SELECT * FROM dbproject.exam WHERE E_ID=${req.params.e_id}`, (err, exam) => {
            if (err) return console.error(err);
            if (!exam.length) return res.sendStatus(404);
            exam = exam[0];
            if (Date.now() < exam.STARTDATE) {
                req.flash("error", "This exam hasn't started yet.");
                res.redirect("/exams/" + req.params.e_id + "");
            } else if (Date.now() > (new Date(exam.STARTDATE).getTime() + exam.DURATION * 60 * 1000)) {
                req.flash("error", "This exam has already finished");
                res.redirect("/exams/" + req.params.e_id + "");
            } else {
                DBconnection.query(`SELECT * FROM dbproject.QUESTIONS WHERE e_id=${req.params.e_id}`, (err, questions) => {
                    if (err) return console.error(err);
                    const userAnswers = req.body;
                    let grade = 0;
                    questions.forEach((question, index) => {
                        if (!userAnswers[`q${index + 1}`])
                            userAnswers[`q${index + 1}`] = "Null";
                        if (userAnswers[`q${index + 1}`] === question.CHOICE_1)
                            grade++;
                    });
                    const updateQuery = "update dbproject.solve set grades=" + grade.toString() + " where examID=" + req.params.e_id + " and userID=" + req.user.ID + " ;";
                    DBconnection.query(updateQuery, (err) => {
                        if (err) { return console.log(err); }
                        DBconnection.query(`SELECT Q_ID FROM DBPROJECT.QUESTIONS WHERE E_ID=${req.params.e_id}`, (err, Q_IDs) => {
                            if (err) return console.error(err);
                            let insertUserAnswerwsQuery = `INSERT INTO dbproject.UserAnswers VALUES`;
                            Q_IDs.forEach((question, q) => {
                                insertUserAnswerwsQuery += ` (${req.user.ID}, ${question.Q_ID}, '${userAnswers[`q${q + 1}`]}'),`;
                            });
                            insertUserAnswerwsQuery = insertUserAnswerwsQuery.slice(0, -1) + ";";
                            DBconnection.query(insertUserAnswerwsQuery, err => {
                                if (err) return console.error(err);
                                req.flash('success', 'Your answers are submitted!');
                                res.redirect("/exams");
                            });
                        });
                    })
                });
            }
        });
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
});

module.exports = router;