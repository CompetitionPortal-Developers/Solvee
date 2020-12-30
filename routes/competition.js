const router = require("express").Router();
const { DBconnection } = require("../config/database");
const dateFormat = require("../config/date-formatting");

router.get('/', (req, res) => {
    const errors = [];

    DBconnection.query('SELECT * FROM dbproject.competition;', (err, rows) => {
        if (err) return console.error(err);
        const competitions = rows;
        if (competitions.length)
            competitions.forEach(competition => {
                competition.STARTDATE = dateFormat(competition.STARTDATE);
                competition.ENDDATE = dateFormat(competition.ENDDATE);
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
        competition.STARTDATE = dateFormat(competition.STARTDATE);
        competition.ENDDATE = dateFormat(competition.ENDDATE);
        res.render("competition-details", {
            title: competition.TITLE,
            competition,
            errors
        });
    });
});

router.get('/questions/:c_id', (req, res) => {
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
            DBconnection.query(`SELECT * FROM dbproject.QUESTIONS WHERE c_id=${req.params.c_id}`, (err, questions) => {
                if (err) return console.error(err);
                if (!questions.length) return res.sendStatus(404);
                res.render("competition-questions", {
                    title: competition.TITLE,
                    competition,
                    questions,
                    errors
                });
            });
        }
    });
});

router.post('/questions/:c_id', (req, res) => {
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
            if (err) return console.error(err);
            res.send(req.body);
        }
    });
});

module.exports = router;