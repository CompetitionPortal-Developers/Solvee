DROP DATABASE IF EXISTS DBPROJECT;
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

CREATE TABLE COMPETITION (
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
foreign key(c_id) references COMPETITION(c_id) ON DELETE CASCADE,
foreign key(e_id) references EXAM(e_id) ON DELETE CASCADE,
QUESTION VARCHAR(500) NOT NULL,
CHOICE_1 VARCHAR(100) NOT NULL,
CHOICE_2 VARCHAR(100) NOT NULL,
CHOICE_3 VARCHAR(100) NOT NULL,
CHOICE_4 VARCHAR(100) NOT NULL
);

create table award (
	userID int references user(ID) on delete cascade,
    competitionID int references competition(C_ID) on delete cascade,
    primary key(userID,competitionID),
    a_type varchar(50) not null
);

INSERT INTO USER (
	Username,
    email,
    pass,
    gender,
    firstName,
    lastName,
    BirthDate
) VALUES (
    'abdullahadel',
    'test1@email.com',
    '$2a$10$quE6k.oeFChLdYr6VvgK8.25K/Ke2gWVV92ZyW/7YJ4ggrwyw7s.i',
    'M',
    'Abdullah',
    'Adel',
    '2001-4-1'
);

INSERT INTO USER (
	Username,
    email,
    pass,
    gender,
    firstName,
    lastName,
    BirthDate
) VALUES (
    'abeerhussain',
    'test2@email.com',
    '$2a$10$1rmlB4qweiPmCpjrIWjmQOprPYldraNi4jDZ.tbSZ0QXETgnlWBmC',
    'F',
    'Abeer',
    'Hussain',
    '2000-4-10'
);