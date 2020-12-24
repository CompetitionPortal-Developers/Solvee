CREATE DATABASE DBPROJECT;
USE DBPROJECT;

create table user (
	ID int not null auto_increment,
    primary key(ID),
    Username varchar(50) unique not null,
    email varchar(50) unique not null,
    pass varchar(500) not null,
    gender varchar(1) not null,
    firstName varchar(50) not null,
    lastName varchar(50) not null,
    avatar varchar(50),
    H boolean,
    BirthDate date not null,
    education varchar(50),
    job varchar(50),
    bio varchar(300)
);

create table donation (
	donation_ID int not null auto_increment,
    primary key(donation_ID),
    amount int not null,
    paymentMethod int not null
);

create table todolist (
	tasks varchar(100) not null,
    deadline datetime
);

create table award (
	userID int references user(ID),
    competitionID int references cometition(C_ID),
    primary key(userID, competitionID),
    A_Type varchar(50)
);

CREATE TABLE COMETITION (
    C_ID INT PRIMARY KEY auto_increment, 
    TITLE VARCHAR(50) NOT NULL,
    CATEGORY VARCHAR(50) NOT NULL, 
    DESCP VARCHAR(50),
    RATING FLOAT DEFAULT 0, 
    STARTDATE DATETIME NOT NULL,
    ENDDATE DATETIME NOT NULL
);

CREATE TABLE EXAM (
    E_ID INT PRIMARY KEY auto_increment, 
    CODE VARCHAR(50) UNIQUE NOT NULL, 
    TITLE VARCHAR(50) NOT NULL,
    CATEGORY VARCHAR(50) NOT NULL, 
    DESCP VARCHAR(50),
    DURATION INT NOT NULL,
    STARTDATE DATETIME NOT NULL,
    ENDDATE DATETIME NOT NULL
);

CREATE TABLE QUESTIONS (
    Q_ID INT PRIMARY KEY auto_increment,
    e_id int,
    c_id int,
    foreign key(c_id) references COMETITION(c_id) ON DELETE CASCADE,
    foreign key(e_id) references EXAM(e_id) ON DELETE CASCADE,
    QUESTION VARCHAR(500) NOT NULL,
    CHOICE_1 VARCHAR(100) NOT NULL,
    CHOICE_2 VARCHAR(100) NOT NULL,
    CHOICE_3 VARCHAR(100) NOT NULL,
    CHOICE_4 VARCHAR(100) NOT NULL
);