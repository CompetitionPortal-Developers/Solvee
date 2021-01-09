INSERT INTO `EXAM` VALUES 
('21','X47Solvee',' Electrical Engineering\'s Ultimate Exam',' Programming',' This one is for beginners.','130','2006-05-07 01:33:09','1991-12-29 04:11:55','1','4'),
('2','X17Solvee',' Alexandria\'s Test','Matrix Calculus',' Are you ready for a huge boost of knowledge.','150','1991-05-05 05:17:08','1974-04-09 09:33:53','2','5'),
('3','X87Solvee',' Software Engineering\'s Exam I ',' Thermodynamics',' This one is for intellectuals.','130','2000-03-03 22:13:05','1990-06-02 00:13:43','3','3'),
('4','X62Solvee',' Spiritful Exam II',' Databases',' Time to earn some spirits.','180','2010-07-17 11:44:44','1978-01-26 00:04:31','4','3'),
('5','X30Solvee',' Mechanical Engineering\'s Main Test',' Databases',' This one is for beginners.','180','2013-04-20 05:02:34','1988-01-04 14:27:45','5','2'),
('6','X14Solvee',' Electrical Engineering\'s Test XII',' Problem Solving',' Go big or go home.','100','2006-04-10 06:07:44','1983-08-23 09:37:17','6','3'),
('7','X38Solvee',' Exam C',' Problem Solving',' This one is for the advanced. ','120','2007-08-07 04:30:09','1988-11-29 04:52:09','7','3'),
('8','X22Solvee',' Hogwarts Exam For Wizards',' Machine Learning',' This one is for intellectuals.','40','1989-12-28 10:24:55','1972-05-18 13:24:24','8','4'),
('9','X33Solvee','The Grand Exam',' Probability',' This one is for the advanced. ','125','1988-03-04 20:05:49','2015-01-11 01:28:23','9','4'),
('10','X70Solvee','Software Engineering\'s Exam II',' Machine Learning',' this exam will leave you mesmerized.','150','1989-03-25 19:57:42','1971-12-13 06:46:10','10','5'),
('11','X60Solvee',' Engineering Exam II',' Databases','Acing was never easier join now! ','40','1999-09-09 06:27:27','1979-03-10 18:41:03','11','3'),
('12','X80Solvee',' Alexandria\'s Grand Test',' Programming',' Time to earn some spirits.','120','1986-05-06 05:59:48','2012-05-13 12:12:47','12','5'),
('13','X71Solvee',' Spiritful Exam I',' Machine Learning',' This one is for beginners.','20','1988-05-07 03:53:52','1979-01-17 01:58:19','13','2'),
('14','X63Solvee','Software Engineering\'s Exam III ',' Programming',' Go big or go home.','20','1971-06-11 02:14:25','1978-09-04 08:29:49','14','4'),
('15','X76Solvee',' Engineering Exam III',' Probability','Acing was never easier join now! ','80','2010-12-27 14:56:35','1977-05-29 23:22:04','15','2'),
('16','X57Solvee',' Electrical Engineering\'s Exam I',' Databases',' This one is for the advanced. ','150','2002-12-07 11:50:27','1982-08-30 14:40:27','16','2'),
('17','X43Solvee',' Spiritful Exam III','Matrix Calculus',' Time to earn some spirits.','40','2017-07-14 11:58:39','1991-09-08 23:19:04','17','2'),
('18','X92Solvee',' Spiritful Test II',' Databases',' this exam will leave you mesmerized.','40','2005-07-01 11:15:57','2000-03-01 21:34:33','18','3'),
('19','X97Solvee',' Exam XI',' Programming','Your two minutes away from advancing your knowledge.','130','1982-03-23 17:20:33','2001-05-03 22:46:56','19','2'),
('20','X69Solvee',' Engineering Exam',' Thermodynamics',' this exam will leave you mesmerized.','100','1977-12-14 22:20:27','1971-03-08 06:45:08','20','2');

update dbproject.exam set ENDDATE='2020-5-5 12:00:00' where E_ID > 2 and E_ID < 8;
update dbproject.exam set ENDDATE='2019-12-5 19:00:00' where E_ID > 7 and E_ID < 13;
update dbproject.exam set ENDDATE='2020-10-15 22:00:00' where E_ID > 12 and E_ID < 18;
update dbproject.exam set ENDDATE='2018-5-5 02:00:00' where E_ID > 17 and E_ID < 23;