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

module.exports = router;