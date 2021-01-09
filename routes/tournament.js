const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const schedule = require("node-schedule");
const { DBconnection } = require("../config/database");
const { format, DBformat } = require("../config/date-formatting");
const dateFormat = require("../config/date-formatting");

router.get("/",(req,res)=>{
    let errors=[];
    const query="select * from dbproject.tournament ;";
    DBconnection.query(query,(err,Tournaments)=>{
        if(err){return console.log(err);}
        res.render("tournaments",{
            title:"Tournaments",
            errors,
            Tournaments
        });
    })
});

router.get("/details/:T_ID",(req,res)=>{
    let errors=[];
    if(req.isAuthenticated()){
        const query="select * from dbproject.tournament as t,dbproject.user as u "
                +"where t.T_ID="+req.params.T_ID+" and t.U_ID=u.ID;";
        DBconnection.query(query,(err,Tournament)=>{
            if(err){return console.log(err);}
            const queryDate="select c.STARTDATE,c.ENDDATE "
                            +"from competition as c,t_contains_cs as t "
                            +"where c.C_ID=t.C_ID and t.T_ID="+req.params.T_ID+" "
                            +"order by c.STARTDATE asc;"
            DBconnection.query(queryDate,(err,compDate)=>{
                if(err){return console.log(err);}
                console.log(compDate);
                for(var i=0;i<compDate.length;i++){
                    compDate[i].STARTDATE=DBformat(compDate[i].STARTDATE);
                    compDate[i].ENDDATE=DBformat(compDate[i].ENDDATE);
                }
                res.render("tournament-details",{
                    title:"Tournament Details",
                    errors,
                    Tournament,
                    compDate
                });
            })
        })
    }else{
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/competitions/:T_ID/:T_TITLE",(req,res)=>{
    let errors=[];
    if(req.isAuthenticated()){
        const T_TITLE=req.params.T_TITLE;
        const query="select * from dbproject.T_contains_Cs as t,dbproject.competition as c "
                    +"where t.T_ID="+req.params.T_ID+" and t.C_ID=c.C_ID;";
        DBconnection.query(query,(err,Tournament)=>{
            if(err){return console.log(err);}

            

            for(var i=0;i<Tournament.length;i++){
                if(Tournament[i].STARTDATE< Date.now()){
                    if(Tournament[i].ENDDATE> Date.now()){
                        Tournament[i].active=1;
                    }
                }
                Tournament[i].STARTDATE=dateFormat.format(Tournament[i].STARTDATE);
                Tournament[i].ENDDATE=dateFormat.format(Tournament[i].ENDDATE);
            }
            //console.log(Tournament);
            res.render("tournament-competitions",{
                title:"Tournament Details",
                errors,
                Tournament,
                T_TITLE
            });
        })
    }else{
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.get("/createTournament",(req,res)=>{
    let errors=[];
    if(req.isAuthenticated()){
        let checkComp=[];
        const queryGetComp="select * from dbproject.competition where U_ID="+req.user.ID+" ;";

        DBconnection.query(queryGetComp,(err,userCompetitions)=>{
            if(err){return console.log(err);}
            let count=0;
            for(var i=0;i<userCompetitions.length;i++){
                if(userCompetitions[i].STARTDATE> Date.now()){
                    checkComp.push(1);
                    count++;
                }else{
                    checkComp.push(0);
                }
            }
            if(count==0 || count==1){
                req.flash("error","You Must Have At least 2 Upcoming Created Competitons To Create A Tournament");
                res.redirect("/competitions/CreateCompetition");
            }
            res.render("create-tournament",({
                title:"Tournament Creation",
                errors,
                userCompetitions,
                checkComp
            }))
        })
    }else{
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

router.post("/createTournament",(req,res)=>{
    let errors=[];
    if(req.isAuthenticated()){
        const compNumber="select max(T_ID) as IDtournament from dbproject.tournament;";

        let objBody=req.body;
        const {tournamentTitle,description,fees}=objBody;
        delete objBody.tournamentTitle;
        delete objBody.description;
        delete objBody.fees;
        //console.log(objBody);
        const query="insert into dbproject.tournament (TITLE,FEES,DESCP,U_ID) values('"+tournamentTitle+"',"+fees+",'"+description+"',"+req.user.ID+");";
        if(tournamentTitle=="" || tournamentTitle.length>50 || tournamentTitle.length<2){
            req.flash("error","Tournament Title Must Be Between 2-50 Characters");
            res.redirect("/tournaments/createTournament");
        }
        if(description=="" || description.length>500 || description.length<10){
            req.flash("error","Tournament Description Must Be Between 10-500 Characters");
            res.redirect("/tournaments/createTournament");
        }
        if(fees.toString().length=="" || fees>50 || fees<0){
            req.flash("error","Tournament Fees Must Be Between 0-50 Coins");
            res.redirect("/tournaments/createTournament");
        }
        let selectedComp=[];
        const competitions=Object.values(objBody);
        let j=0;
        //console.log(competitions);
        
        //console.log(selectedComp);
        DBconnection.query(query,(err)=>{
            if(err){return console.log(err);}
            DBconnection.query(compNumber,(err,result)=>{
                
                const T_ID=result[0].IDtournament;
                let queryy="insert into dbproject.t_contains_cs values";
                for(var i=0;i<competitions.length;i++){
                    if(j!=0){
                        queryy+=",";
                    }
                    j++;
                    let insert="("+T_ID+","+competitions[i]+",0)";
                    queryy+=insert
                }
                //console.log(queryy);
                if(j==0 || j>5){
                    req.flash("error","Tournament Must Include 1-5 Competitions, Please Select Competitions Within Limit");
                    res.redirect("/tournaments/createTournament");
                }
                DBconnection.query(queryy,(err)=>{
                    if(err){return console.log(err);}
                    req.flash("success","Your Tournament Is Created Successfully");
                    res.redirect("/tournaments");
                })
            })
        })
    }else{
        req.flash("error", "Please log in first");
        res.redirect("/users/login");
    }
})

module.exports = router;