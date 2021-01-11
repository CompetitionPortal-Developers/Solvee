const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const schedule = require("node-schedule");
const { DBconnection } = require("../config/database");
const dateFormat = require("../config/date-formatting");

function GiveRewards(List, index, Award, comp_ID) {
    if (index >= List.length || index == 3) {
        return
    } else {
        const giveAward = "update dbproject.award set userID=" + List[index].ID + " where a_type='" + Award + "' and competitionID=" + comp_ID + " ;";
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
    DBconnection.query(`SELECT SPIRITS FROM DBPROJECT.USER WHERE ID=${List[index].ID};`, (err, [{ SPIRITS }]) => {
        console.log(`User ${List[index].ID} has ${SPIRITS} spirits`);
        const updateSpirits = `UPDATE DBPROJECT.USER SET SPIRITS=${SPIRITS + spiritsDistribution[List.length][index]} WHERE ID=${List[index].ID};`;
        DBconnection.query(updateSpirits, err => {
            if (err) return console.error(err);
            giveSpirits(List, index + 1, spiritsDistribution);
        });
    });
}

router.get("/", (req, res) => {
    let errors = [];
    const deleteEmptyCompetitions = "select C_ID from dbproject.competition where C_ID not in (select C_ID from dbproject.questions where e_id is null);";
    const query = "select * from dbproject.tournament ;";
    DBconnection.query(deleteEmptyCompetitions,(err)=>{
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
        const query = 'SELECT * FROM dbproject.tournament;';
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
        const query = 'SELECT * FROM dbproject.tournament;';
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
        DBconnection.query(`SELECT * FROM dbproject.tournament WHERE T_ID=${searchedTournament};`, (err, [tournament]) => {
            if (err) return console.error(err);
            res.redirect(`/tournaments/details/${tournament.T_ID}`);
        });
    }
});

router.get("/details/:T_ID", (req, res) => {
    let errors = [];
    let alreadyParticipated = false;
    if (req.isAuthenticated()) {
        const queryCreator = "select U_ID from dbproject.tournament where U_ID=" + req.user.ID + " and T_ID=" + req.params.T_ID + ";";
        const confirmQuery = "select userID from dbproject.participates_in_t where tournamentID=" + req.params.T_ID + " and userID=" + req.user.ID + " ;";
        const query = "select * from dbproject.tournament as t,dbproject.user as u "
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
                            if (Result.length != 0 || Creator.length != 0 || maxEndDate[0].ENDDATE < Date.now()) {
                                alreadyParticipated = true;//don't show the join tournament button
                            }
                            res.render("tournament-details", {
                                title: "Tournament Details",
                                errors,
                                Tournament,
                                compDate,
                                alreadyParticipated
                            });
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
        const queryCreator = "select U_ID from dbproject.tournament where U_ID=" + req.user.ID + " ;";
        const confirmQuery = "select userID from dbproject.participates_in_t where tournamentID=" + req.params.T_ID + " and userID=" + req.user.ID + ";";
        const T_TITLE = req.params.T_TITLE;
        const T_ID = req.params.T_ID;
        const query = "select * from dbproject.T_contains_Cs as t,dbproject.competition as c "
            + "where t.T_ID=" + req.params.T_ID + " and t.C_ID=c.C_ID;";
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
            DBconnection.query(confirmQuery, (err, Result) => {
                if (err) { return console.log(err); }
                DBconnection.query(queryCreator, (err, Creator) => {
                    if (err) { return console.log(err); }
                    if (Result.length != 0 || Creator.length != 0) {
                        res.render("tournament-competitions", {
                            title: "Tournament Details",
                            errors,
                            Tournament,
                            T_TITLE,
                            T_ID,
                            alreadyParticipated
                        });
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
        const deleteEmptyCompetitions = "select C_ID from dbproject.competition where C_ID not in (select C_ID from dbproject.questions where e_id is null);";
        let checkComp = [];
        const queryGetComp = "select * from dbproject.competition where U_ID=" + req.user.ID + " ;";
        DBconnection.query(deleteEmptyCompetitions,(err)=>{
            if (err) { return console.log(err); }
            DBconnection.query(queryGetComp, (err, userCompetitions) => {
                if (err) { return console.log(err); }
                let count = 0;
                for (var i = 0; i < userCompetitions.length; i++) {
                    if (userCompetitions[i].STARTDATE > Date.now()) {
                        checkComp.push(1);
                        count++;
                    } else {
                        checkComp.push(0);
                    }
                }
                if (count == 0 || count == 1) {
                    req.flash("error", "You Must Have At least 2 Upcoming Created Competitons To Create A Tournament");
                    res.redirect("/competitions/CreateCompetition");
                }
                res.render("create-tournament", ({
                    title: "Tournament Creation",
                    errors,
                    userCompetitions,
                    checkComp
                }))
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
        const compNumber = "select max(T_ID) as IDtournament from dbproject.tournament;";

        let objBody = req.body;
        let { tournamentTitle, description, fees } = objBody;
        delete objBody.tournamentTitle;
        delete objBody.description;
        delete objBody.fees;
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
        const query = "insert into dbproject.tournament (TITLE,FEES,DESCP,U_ID) values('" + tournamentTitle + "'," + fees + ",'" + description + "'," + req.user.ID + ");";

        let selectedComp = [];
        const competitions = Object.values(objBody);
        let j = 0;

        DBconnection.query(query, (err) => {
            if (err) {
                req.flash("error", "Please Change Tournament Title & Try Again");
                res.redirect('back');
            }
            DBconnection.query(compNumber, (err, result) => {
                const T_ID = result[0].IDtournament;
                let updateFees = "update dbproject.competition set cost=0 where C_ID in (select b.c_ID from dbproject.t_contains_cs as b where b.T_ID=" + T_ID + ");";
                let queryy = "insert into dbproject.t_contains_cs values";
                for (var i = 0; i < competitions.length; i++) {
                    if (j != 0) {
                        queryy += ",";
                    }
                    j++;
                    let insert = "(" + T_ID + "," + competitions[i] + ",0)";
                    queryy += insert
                }
                if (j < 2 || j > 5) {
                    console.log("here1");
                    req.flash("error", "Tournament Must Include 2-5 Competitions, Please Select Competitions Within Limit");
                    res.redirect("/tournaments/createTournament");
                }
                DBconnection.query(queryy, (err) => {
                    if (err) { return console.log(err); }
                    DBconnection.query(updateFees, (err) => {
                        if (err) {
                            console.log("here3");
                            return console.log(err);
                        }
                        console.log("here4");
                        schedule.scheduleJob(endDate, function () {
                            console.log(`\n\n\n\n\n\n\n\n Tournament ${tournamentTitle} is finished.`);
                            console.log(rows.insertId);

                            const query = "select u.ID,u.Username,l.grade,l.duration,l.score from dbproject.leaderboard as l,dbproject.user as u "
                                + "where l.C_ID=" + rows.insertId + " and " + "u.ID=l.U_ID order by score desc, grade desc, duration asc;";

                            DBconnection.query(query, (err, List) => {
                                if (err) {
                                    return console.log(err);
                                } else {
                                    console.log(List);
                                    GiveRewards(List, 0, 'Gold', rows.insertId);
                                    const totalSpirits = List.length * competitionCost;
                                    const spiritsDistribution = [
                                        [0],
                                        [totalSpirits],
                                        [Math.floor(totalSpirits * 0.6), Math.floor(totalSpirits * 0.4)],
                                        [Math.floor(totalSpirits * 0.5), Math.floor(totalSpirits * 0.3), Math.floor(totalSpirits * 0.2)],
                                        [Math.floor(totalSpirits * 0.4), Math.floor(totalSpirits * 0.3), Math.floor(totalSpirits * 0.2), Math.floor(totalSpirits * 0.1)],
                                        [Math.floor(totalSpirits * 0.3), Math.floor(totalSpirits * 0.25), Math.floor(totalSpirits * 0.2), Math.floor(totalSpirits * 0.15), Math.floor(totalSpirits * 0.1)],
                                    ]
                                    console.log(spiritsDistribution);
                                    giveSpirits(List, 0, spiritsDistribution);
                                }
                            });
                        });
                        req.flash("success", "Your Tournament Is Created Successfully");
                        res.redirect("/tournaments/");
                    });
                });
            });
        });
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/join/:T_ID/:T_TITLE", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
        const checkMoney = "select spirits from dbproject.user where ID=" + req.user.ID + " ;";
        const getFees = "select sum(c.cost) as total from dbproject.competition as c,dbproject.t_contains_cs as t "
            + "where c.C_ID=t.C_ID and t.T_ID=" + req.params.T_ID + " ;";
        const getTournamentFees = "select FEES from dbproject.tournament where T_ID=" + req.params.T_ID + " ;";
        const queryInsert = "insert into dbproject.participates_in_t (userID,tournamentID) values(" + req.user.ID + "," + req.params.T_ID + ");";
        DBconnection.query(checkMoney, (err, userMoney) => {
            if (err) { return console.log(err); }
            DBconnection.query(getFees, (err, competitionFees) => {
                if (err) { return console.log(err); }
                DBconnection.query(getTournamentFees, (err, tournamentFees) => {
                    if (err) { return console.log(err); }
                    const totalFees = competitionFees[0].total + tournamentFees[0].FEES
                    if (totalFees > userMoney[0].spirits) {
                        req.flash("error", "You Must Have At Least " + competitionFees[0].cost + tournamentFees[0].FEES + " To Join Tournament");
                        res.redirect("back");
                    } else {
                        const newBalance = userMoney[0].spirits - totalFees;
                        const payQuery = "update dbproject.user set spirits=" + newBalance + " where ID=" + req.user.ID + " ;";
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
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/leaderboard/:T_ID/:T_TITLE", (req, res) => {
    let errors = [];
    if (req.isAuthenticated()) {
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
        DBconnection.query(joinQuery, (err, Top5) => {//Getting the total score of the participants
            //console.log(Top5);
            if (err) { return console.log(err); }
            let queryLB = "select u.Username,l.grade,l.duration,l.score,l.C_ID,date(c.STARTDATE) as stDate,c.TITLE "
                + "from dbproject.leaderboard as l,dbproject.user as u,dbproject.competition as c,dbproject.t_contains_cs as t "
                + "where l.C_ID=c.C_ID and t.C_ID=c.C_ID and t.T_ID=" + T_ID + " and u.ID=l.U_ID "
                + "order by stDate asc;";
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
                DBconnection.query(lastStandingQuery, (err, competitionCount) => {
                    if (err) { return console.log(err); }
                    //console.log(Result);
                    //console.log(competitionCount);
                    res.render("tournament-leaderboard", {
                        title: "Tournament LeaderBoard",
                        errors,
                        Result,
                        competitionCount,
                        T_ID,
                        T_TITLE,
                        Top5
                    })
                })
            })
        })
    } else {
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

module.exports = router;