const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const schedule = require("node-schedule");
const { DBconnection } = require("../config/database");
const { DBformat } = require("../config/date-formatting");
const dateFormat = require("../config/date-formatting");

function GiveRewards(List, index, Award, comp_ID) {
    if (index >= List.length || index == 3) {
        return
    } else {
        const giveAward = "update award set userID=" + List[index].ID + " where a_type='" + Award + "' and competitionID=" + comp_ID + " ;";
        DBconnection.query(giveAward, (err) => {
            if (err) { return console.log(err); }
            if (index == 0) { Award = 'Silver'; }
            if (index == 1) { Award = 'Bronze'; }
            GiveRewards(List, index + 1, Award, comp_ID);
        })
    }
}

function giveSpirits(List, index, spiritsDistribution) {
    if (index >= List.length || index === 5)
        return;
    DBconnection.query(`SELECT SPIRITS FROM USER WHERE ID=${List[index].ID};`, (err, [{ SPIRITS }]) => {
        console.log(`User ${List[index].ID} has ${SPIRITS} spirits`);
        const updateSpirits = `UPDATE USER SET SPIRITS=${SPIRITS + spiritsDistribution[List.length][index]} WHERE ID=${List[index].ID};`;
        DBconnection.query(updateSpirits, err => {
            if (err) return console.error(err);
            giveSpirits(List, index + 1, spiritsDistribution);
        });
    });
}

router.get("/", (req, res) => {
    let errors = [];
    const deleteEmptyCompetitions = "select C_ID from competition where C_ID not in (select C_ID from questions where e_id is null);";
    const query = "select * from tournament ;";
    DBconnection.query(deleteEmptyCompetitions, (err) => {
        if (err) { return console.log(err); }
        DBconnection.query(query, (err, Tournaments) => {
            if (err) { return console.log(err); }
            res.render("tournaments", {
                title: "Tournaments",
                errors,
                Tournaments
            });
        });
    })
});

router.post('/search', [
    body('searchedTournament', 'Please enter the name or the ID of the tournament that you want to search for.').notEmpty()
], (req, res) => {
    let errors = validationResult(req).errors;
    const { searchedTournament } = req.body;
    if (errors.length) {
        const query = 'SELECT * FROM tournament;';
        DBconnection.query(query, (err, tournaments) => {
            if (err) return console.error(err);
            return res.render('tournaments', {
                title: "Tournaments",
                Tournaments: tournaments,
                searchedTournament,
                errors
            });
        });
    } else if (isNaN(searchedTournament)) {
        const query = 'SELECT * FROM tournament;';
        DBconnection.query(query, (err, tournaments) => {
            if (err) return console.error(err);
            tournaments = tournaments.filter(tournament => tournament.TITLE.toLowerCase().includes(searchedTournament.toLowerCase()));
            return res.render('tournaments', {
                title: "Tournaments",
                Tournaments: tournaments,
                searchedTournament,
                errors
            });
        });
    } else {
        DBconnection.query(`SELECT * FROM tournament WHERE T_ID=${searchedTournament};`, (err, [tournament]) => {
            if (err) return console.error(err);
            res.redirect(`/tournaments/details/${tournament.T_ID}`);
        });
    }
});

router.get("/details/:T_ID", (req, res) => {
    let errors = [];
    let alreadyParticipated = false;
    if (req.isAuthenticated()) {
        const activeORnot = "select activated from tournament where T_ID=" + req.params.T_ID + ";";
        const queryCreator = "select U_ID from tournament where U_ID=" + req.user.ID + " and T_ID=" + req.params.T_ID + ";";
        const confirmQuery = "select userID from participates_in_t where tournamentID=" + req.params.T_ID + " and userID=" + req.user.ID + " ;";
        const query = "select * from tournament as t,user as u "
            + "where t.T_ID=" + req.params.T_ID + " and t.U_ID=u.ID;";
        DBconnection.query(query, (err, Tournament) => {
            if (err) { return console.log(err); }
            const queryDate = "select c.STARTDATE,c.ENDDATE,c.TITLE "
                + "from competition as c,t_contains_cs as t "
                + "where c.C_ID=t.C_ID and t.T_ID=" + req.params.T_ID + " "
                + "order by c.STARTDATE asc;"
            //////-----------------------use below query to get the endDtae of tournament-----------------------//////
            const queryENDDate = "select c.STARTDATE,c.ENDDATE,c.TITLE "
                + "from competition as c,t_contains_cs as t "
                + "where c.C_ID=t.C_ID and t.T_ID=" + req.params.T_ID + " "
                + "order by c.ENDDATE desc;"
            DBconnection.query(queryDate, (err, compDate) => {
                if (err) { return console.log(err); }
                //console.log(compDate);
                for (var i = 0; i < compDate.length; i++) {
                    compDate[i].STARTDATE = dateFormat.DBformat(compDate[i].STARTDATE);
                    compDate[i].ENDDATE = dateFormat.DBformat(compDate[i].ENDDATE);
                }
                DBconnection.query(confirmQuery, (err, Result) => {
                    //if the user is already participated or not
                    if (err) { return console.log(err); }
                    DBconnection.query(queryENDDate, (err, maxEndDate) => {
                        //if the tournament competitions are all done or not
                        if (err) { return console.log(err); }
                        DBconnection.query(queryCreator, (err, Creator) => {
                            //if the curr user is the creator of the tournament
                            //////////////------------------------------  maxEndDate[0].ENDDATE  ------------------------------//////////////
                            if (err) { return console.log(err); }
                            DBconnection.query(activeORnot, (err, TournamentisActive) => {
                                if (err) { return console.log(err); }
                                if (maxEndDate.length != 0) {
                                    if (maxEndDate[0].ENDDATE < Date.now()) {
                                        alreadyParticipated = true;//don't show the join tournament button
                                    }
                                }
                                if (Result.length != 0 || Creator.length != 0) {
                                    alreadyParticipated = true;//don't show the join tournament button
                                }
                                res.render("tournament-details", {
                                    title: "Tournament Details",
                                    errors,
                                    Tournament,
                                    compDate,
                                    alreadyParticipated,
                                    TournamentisActive
                                });
                            })
                        })
                    })
                })
            })
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/competitions/:T_ID/:T_TITLE", (req, res) => {
    let errors = [];
    let alreadyParticipated = false;
    if (req.isAuthenticated()) {
        const activeORnot = "select activated from tournament where T_ID=" + req.params.T_ID + ";";
        const queryCreator = "select U_ID from tournament where U_ID=" + req.user.ID + " and T_ID=" + req.params.T_ID + " ;";
        const confirmQuery = "select userID from participates_in_t where tournamentID=" + req.params.T_ID + " and userID=" + req.user.ID + ";";
        const T_TITLE = req.params.T_TITLE;
        const T_ID = req.params.T_ID;
        let today = new Date();
        today = dateFormat.DBformat(today);
        const query = "select * from T_contains_Cs as t,competition as c "
            + "where t.T_ID=" + req.params.T_ID + " and t.C_ID=c.C_ID "
            + "order by c.C_ID ;";
        const SelectFromCompetitions = "select * from competition as c "
            + "where c.U_ID=" + req.user.ID + " and c.C_ID not in ("
            + "select cs.C_ID from T_contains_Cs as cs"
            + ") and c.STARTDATE > '" + today + "';";
        DBconnection.query(query, (err, Tournament) => {
            if (err) { return console.log(err); }
            for (var i = 0; i < Tournament.length; i++) {
                if (Tournament[i].STARTDATE < Date.now()) {
                    if (Tournament[i].ENDDATE > Date.now()) {
                        Tournament[i].active = 1;
                    }
                }
                Tournament[i].STARTDATE = dateFormat.format(Tournament[i].STARTDATE);
                Tournament[i].ENDDATE = dateFormat.format(Tournament[i].ENDDATE);
            }
            //console.log(Tournament);
            DBconnection.query(confirmQuery, (err, Result) => {
                if (err) { return console.log(err); }
                DBconnection.query(queryCreator, (err, Creator) => {
                    if (err) { return console.log(err); }
                    if (Result.length != 0 || Creator.length != 0) {
                        DBconnection.query(activeORnot, (err, compNumber) => {
                            if (err) { return console.log(err); }
                            DBconnection.query(SelectFromCompetitions, (err, selectCompetitions) => {
                                if (err) { return console.log(err); }
                                for (var i = 0; i < selectCompetitions.length; i++) {
                                    selectCompetitions[i].STARTDATE = dateFormat.format(selectCompetitions[i].STARTDATE);
                                    selectCompetitions[i].ENDDATE = dateFormat.format(selectCompetitions[i].ENDDATE);
                                }
                                res.render("tournament-competitions", {
                                    title: "Tournament Details",
                                    errors,
                                    Tournament,
                                    T_TITLE,
                                    T_ID,
                                    alreadyParticipated,
                                    compNumber,
                                    Creator,
                                    selectCompetitions
                                });
                            })
                        })
                    } else {
                        req.flash("error", "You aren't allowed to view this page as you aren't a participant in the tournament");
                        res.redirect('back');
                    }
                })

            })

        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/createTournament", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        let today = new Date();
        today = dateFormat.DBformat(today);
        const deleteEmptyCompetitions = "delete from competition where C_ID not in (select C_ID from questions where e_id is null);";
        const selectUserCompetition = "select count(c.C_ID) as totalComp from competition as c "
            + "where c.U_ID=" + req.user.ID + " and c.C_ID not in ("
            + "select cs.C_ID from t_contains_cs as cs ) "
            + " and c.STARTDATE > '" + today + "' ;";
        DBconnection.query(deleteEmptyCompetitions, (err) => {
            if (err) { return console.log(err); }
            DBconnection.query(selectUserCompetition, (err, theCompNumber) => {
                if (err) { return console.log(err); }
                console.log(theCompNumber);
                if (theCompNumber[0].totalComp >= 2) {
                    res.render("create-tournament", ({
                        title: "Tournament Creation",
                        errors
                    }));
                } else {
                    req.flash("error", "Your Must Have At Least 2-5 Active Competitions To Create A Tournament");
                    req.flash("success", "Your Are Redirected To Create Competitions Page");
                    res.redirect("/competitions/CreateCompetition");
                }
            })
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.post("/createTournament", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {

        let { tournamentTitle, description, fees } = req.body;

        if (tournamentTitle == "" || tournamentTitle.length > 50 || tournamentTitle.length < 2) {
            req.flash("error", "Tournament Title Must Be Between 2-50 Characters");
            res.redirect("/tournaments/createTournament");
        }
        if (description == "" || description.length > 500 || description.length < 10) {
            req.flash("error", "Tournament Description Must Be Between 10-500 Characters");
            res.redirect("/tournaments/createTournament");
        }
        if (fees.toString().length == "" || fees > 10000 || fees < 3000) {
            req.flash("error", "Tournament Fees Must Be Between 0-50 Coins");
            res.redirect("/tournaments/createTournament");
        }

        tournamentTitle = tournamentTitle.toString().replace(/'/g, "\\'");
        description = description.toString().replace(/'/g, "\\'");
        const query = "insert into tournament (TITLE,FEES,DESCP,U_ID) values('" + tournamentTitle + "'," + fees + ",'" + description + "'," + req.user.ID + ");";
        DBconnection.query(query, (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Tournament Title Is Invalid Please Change It & Try Again");
                res.redirect('back');
            } else {
                const getTournament = "select * from tournament where TITLE='" + tournamentTitle + "' ;";
                DBconnection.query(getTournament, (err, Tournament) => {
                    if (err) { return console.log(err); }
                    req.flash("success", "Tournament is created successfully");
                    res.redirect("/tournaments/competitions/" + Tournament[0].T_ID + "/" + tournamentTitle + "");
                })
            }
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/join/:T_ID/:T_TITLE", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const checkMoney = "select spirits from user where ID=" + req.user.ID + " ;";
        const getFees = "select sum(c.cost) as total from competition as c,t_contains_cs as t "
            + "where c.C_ID=t.C_ID and t.T_ID=" + req.params.T_ID + " ;";
        const getTournamentFees = "select FEES from tournament where T_ID=" + req.params.T_ID + " ;";
        const queryInsert = "insert into participates_in_t (userID,tournamentID) values(" + req.user.ID + "," + req.params.T_ID + ");";
        DBconnection.query(checkMoney, (err, userMoney) => {
            if (err) { return console.log(err); }
            if (userMoney.length != 0) {
                DBconnection.query(getFees, (err, competitionFees) => {
                    if (err) { return console.log(err); }
                    DBconnection.query(getTournamentFees, (err, tournamentFees) => {
                        if (err) { return console.log(err); }
                        const totalFees = competitionFees[0].total + tournamentFees[0].FEES
                        if (totalFees > userMoney[0].spirits) {
                            req.flash("error", "You Must Have At Least " + totalFees + " Coins To Join Tournament");
                            res.redirect("back");
                        } else {
                            const newBalance = userMoney[0].spirits - totalFees;
                            const payQuery = "update user set spirits=" + newBalance + " where ID=" + req.user.ID + " ;";
                            console.log(payQuery);
                            DBconnection.query(payQuery, (err) => {
                                if (err) { return console.log(err); }
                                console.log(queryInsert);
                                DBconnection.query(queryInsert, (err) => {

                                    if (err) { return console.log(err); }
                                    req.flash("success", "You Have Joined Tournament Successfully");
                                    res.redirect("/tournaments/competitions/" + req.params.T_ID + "/" + req.params.T_TITLE);
                                })
                            })
                        }
                    })
                })
            } else {
                req.flash("error", "Tournament Isn't Activated Yet To Join It");
                res.redirect('back');
            }
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/leaderboard/:T_ID/:T_TITLE", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const activeORnot = "select activated from tournament where T_ID=" + req.params.T_ID + " ;";
        const T_ID = req.params.T_ID;
        const T_TITLE = req.params.T_TITLE;
        const joinQuery = "select sum(l.score) as total,l.Username "
            + "from ( "
            + "select ll.score,u.Username "
            + "from leaderboard as ll,t_contains_cs as t,user as u,participates_in_t as p "
            + "where ll.C_ID=t.C_ID and ll.U_ID=u.ID and t.T_ID=" + T_ID + " and u.ID=p.userID and p.tournamentID=" + T_ID + " "
            + ") as l "
            + "group by l.Username "
            + "order by l.score desc ;";
        DBconnection.query(activeORnot, (err, active) => {
            if (err) { return console.log(err); }
            if (active[0].activated) {
                DBconnection.query(joinQuery, (err, Top5) => {//Getting the total score of the participants
                    //console.log(Top5);
                    if (err) { return console.log(err); }
                    let queryLB = "select u.Username,l.grade,l.duration,l.score,l.C_ID,date(c.STARTDATE) as stDate,c.TITLE "
                        + "from leaderboard as l,user as u,competition as c,t_contains_cs as t,participates_in_t as pt "
                        + "where l.C_ID=c.C_ID and t.C_ID=c.C_ID and t.T_ID=" + T_ID + " and u.ID=l.U_ID and pt.userID=u.ID and t.T_ID=pt.tournamentID "
                        + "order by l.C_ID asc;";
                    DBconnection.query(queryLB, (err, Result) => {
                        if (err) { return console.log(err); }
                        let lastStandingQuery = "select count(X.C_ID) as cc "
                            + "from (select date(c.STARTDATE) as st,c.C_ID "
                            + "from competition as c,leaderboard as l,t_contains_cs as t "
                            + "where c.C_ID=t.C_ID and l.C_ID=c.C_ID and t.T_ID=" + T_ID + " "
                            + "order by st "
                            + ") as X "
                            + "group by X.C_ID "
                            + "order by X.st ;";
                        const numberOfCompetitions = "select count(C_ID) as numCompetitions from t_contains_cs where T_ID=" + T_ID + " ;";
                        DBconnection.query(lastStandingQuery, (err, competitionCount) => {
                            if (err) { return console.log(err); }
                            res.render("tournament-leaderboard", {
                                title: "Tournament LeaderBoard",
                                errors,
                                Result,
                                competitionCount,
                                T_ID,
                                T_TITLE,
                                Top5
                            });
                        })
                    })
                })
            } else {
                req.flash("error", "Tournament Isn't Activated Yet To Join It");
                res.redirect('back');
            }
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.post("/add/competition/:T_ID/:C_ID", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const notExceed5 = "select * from t_contains_cs where T_ID=" + req.params.T_ID + " ;";
        const insertComp = "insert into t_contains_cs values(" + req.params.T_ID + "," + req.params.C_ID + ",0) ;";
        const competitionFeesZero = "update competition set cost=0 where C_ID=" + req.params.C_ID + " ;";
        DBconnection.query(notExceed5, (err, exceedResult) => {
            if (err) { return console.log(err); }
            if (exceedResult.length >= 5) {
                req.flash("error", "Sorry You Can't Add More Than 5 Competitions To Your Tournament");
                res.redirect('back');
            } else {
                DBconnection.query(competitionFeesZero, (err) => {
                    if (err) { return console.log(err); }
                    else {
                        DBconnection.query(insertComp, (err) => {
                            if (err) { return console.log(err); }
                            req.flash("success", "Competition Was Added Successfully To Your Tournament");
                            res.redirect('back');
                        })
                    }
                })
            }
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.post("/activate/:T_ID", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const withinLimit = "select * from t_contains_cs where T_ID=" + req.params.T_ID + " ;";
        const activateNow = "update tournament set activated=1 where T_ID=" + req.params.T_ID + " ;";
        DBconnection.query(withinLimit, (err, inLimit) => {
            if (err) { return console.log(err); }
            if (inLimit.length >= 2 && inLimit.length <= 5) {
                DBconnection.query(activateNow, (err) => {
                    if (err) { return console.log(err); }
                    req.flash("success", "Your Tournament Was Activated Successfully");
                    res.redirect("/tournaments/details/" + req.params.T_ID + "");
                })
            } else {
                req.flash("error", "Your Tournament Must Have Between 2-5 Added Competitions To Be Activated");
                res.redirect("back");
            }
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/remove/:T_ID/:C_ID", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const removeCompetitions = "delete from t_contains_cs where T_ID=" + req.params.T_ID + " and C_ID=" + req.params.C_ID + " ;";
        DBconnection.query(removeCompetitions, (err) => {
            if (err) { return console.log(err); }
            req.flash("success", "Competition Was Removed From Tournament Successfully");
            res.redirect("back");
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

module.exports = router;