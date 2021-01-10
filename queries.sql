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
    BirthDate date not null,
    education varchar(50),
    job varchar(50),
    bio varchar(300),
    spirits int default 5200
);

create table donation (
    donation_ID int not null auto_increment,
    amount int not null,
    paymentMethod varchar(10) not null,
    fullName varchar(50) not null,
    country varchar(50) not null,
    d_address varchar(100) not null,
    zipcode int,
    email varchar(50) references user(email),
    primary key(donation_ID)
);

create table todolist (
	U_ID int not null references user(ID),
    todoID int not null auto_increment,
    primary key(todoID),
	tasks varchar(100) not null,
    deadline datetime
);

alter table donation auto_increment=1234;

CREATE TABLE EXAM (
    E_ID INT PRIMARY KEY auto_increment,
    CODE VARCHAR(50) UNIQUE DEFAULT "XSolvee",
    TITLE VARCHAR(50) NOT NULL UNIQUE,
    CATEGORY VARCHAR(50) NOT NULL,
    DESCP VARCHAR(500),
    DURATION INT NOT NULL,
    STARTDATE DATETIME NOT NULL,
    U_ID int not null references user(ID) on delete cascade,
    Qnum int not null
);

CREATE TABLE COMPETITION (
    C_ID INT PRIMARY KEY auto_increment, 
    TITLE VARCHAR(50) NOT NULL UNIQUE,
    CATEGORY VARCHAR(50) NOT NULL, 
    DESCP VARCHAR(500),
    RATING FLOAT DEFAULT 0, 
    STARTDATE DATETIME NOT NULL,
    ENDDATE DATETIME NOT NULL,
    U_ID int not null references user(ID) on delete cascade,
    Qnum int not null,
    cost int not null
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
    userID int references user(ID) on delete set null ,
    competitionID int references competition(C_ID) on delete cascade,
    a_type varchar(50) not null,
    primary key(a_type,competitionID)
);

create table participate (
    userID int references user(ID) on delete cascade,
    competitionID int references competition(C_ID) on delete cascade,
    primary key(userID, competitionID),
    s_time datetime default current_timestamp
);

create table solve (
    userID int references user(ID) on delete cascade,
    examID int references exam(E_ID) on delete cascade,
    primary key(userID, examID),
    s_time datetime default current_timestamp,
    grades int default 0
);

create table leaderboard (
    U_ID int not null references user(ID) on delete cascade,
    C_ID int references competition(C_ID) on delete cascade,
    primary key(U_ID,C_ID),
    grade int not null,
    duration decimal(9, 2) not null,
    score decimal(9, 2) not null
);

create table UserAnswers (
    U_ID int not null references user(ID) on delete cascade,
    Q_ID int not null references questions(Q_ID) on delete cascade,
    primary key(U_ID,Q_ID),
    Choice varchar(100) DEFAULT 'No Answer'
);

create table RanksIn (
    U_ID int not null references user(ID) on delete cascade,
    C_ID int not null references COMPETITION(C_ID) on delete cascade,
    primary key(U_ID,C_ID)
);

create table review (
    U_ID int not null references user(ID) on delete cascade,
    C_ID int not null references COMPETITION(C_ID) on delete cascade,
    primary key(U_ID, C_ID),
    comment varchar(200) not null,
    rating int not null,
    react varchar(5) not null,
    dateSubmit datetime default current_timestamp
);

create table tournament(
    T_ID INT PRIMARY KEY auto_increment,
    TITLE VARCHAR(50) NOT NULL UNIQUE,
    FEES int,
    DESCP VARCHAR(500),
    U_ID int not null references user(U_ID) on delete cascade
);

create table T_contains_Cs(
    T_ID int NOT NULL references tournament(T_ID) on delete cascade,
    C_ID int NOT NULL references competition(ID) on delete cascade,
    primary key(T_ID,C_ID),
    active boolean not null default 0
);

create table participates_in_T (
    userID int references user(ID) on delete cascade,
    tournamentID int references tournament(T_ID) on delete cascade,
    primary key(userID, tournamentID)
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
), (
    'abeerhussain',
    'test2@email.com',
    '$2a$10$1rmlB4qweiPmCpjrIWjmQOprPYldraNi4jDZ.tbSZ0QXETgnlWBmC',
    'F',
    'Abeer',
    'Hussain',
    '2000-4-10'
),(
    'essamwessam',
    'test3@email.com',
    '$2a$10$1rmlB4qweiPmCpjrIWjmQOprPYldraNi4jDZ.tbSZ0QXETgnlWBmC',
    'M',
    'Essam',
    'Wessam',
    '1999-11-11'
);

INSERT INTO COMPETITION (
    TITLE,
    CATEGORY,
    DESCP,
    RATING,
    STARTDATE,
    ENDDATE,
    U_ID,
    Qnum,
    cost
) VALUES (
    'C++ Algorithms Challenge',
    'Computer Science',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    3.4,
    '2020-12-12 18:00:00',
    '2021-2-12 18:00:00',
    1,
    2,
    2000
), (
    'SQL Queries Challenge',
    'Computer Science',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    0,
    '2020-12-25 09:00:00',
    '2021-2-28 09:00:00',
    2,
    2,
    1000
);

INSERT INTO QUESTIONS (
    c_id,
    QUESTION,
    CHOICE_1,
    CHOICE_2,
    CHOICE_3,
    CHOICE_4
) VALUES (
    1,
    'How to increment a variable named x in C++ by one?',
    'x++',
    'x -= 1',
    'x--',
    'x = 1'
), (
    1,
    'How to increment a variable named x in C++ by one?',
    'x++',
    'x -= 1',
    'x--',
    'x = 1'
), (
    2,
    'How to increment a variable named x in C++ by one?',
    'x++',
    'x -= 1',
    'x--',
    'x = 1'
), (
    2,
    'How to increment a variable named x in C++ by one?',
    'x++',
    'x -= 1',
    'x--',
    'x = 1'
);

INSERT INTO EXAM (
    TITLE,
    CODE,
    CATEGORY,
    DESCP,
    STARTDATE,
    DURATION,
    U_ID,
    Qnum
) VALUES (
    'ELC Exam',
    'X3Solvee',
    'Physics',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    '2020-2-20 09:00:00',
    '10',
    '1',
    '4'
);