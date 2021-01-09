INSERT INTO `COMPETITION` VALUES 
('21',' Challenge XI',' Databases',' This one is for beginners.','5','2010-03-16 07:59:01','1991-11-16 23:40:28','20','5','162'),
('22',' Stanford Competition III',' Machine Learning','Your two minutes away from advancing your knowledge.','3','1984-09-01 22:32:16','2003-03-30 00:33:08','22','4','62'),
('3',' Cairo\'s Challenge XIII',' Machine Learning',' this competition will leave you mesmerized.','2','1972-10-16 07:14:26','1977-08-14 14:26:55','35','2','462'),
('4',' Cairo\'s Ultimate Competition','Matrix Calculus',' Time to earn some spirits.','0','1970-07-31 01:28:45','1970-06-12 18:22:38','17','2','284'),
('5',' Spiritful Challenge VI',' Thermodynamics',' This one is for the advanced.','4','1973-01-05 03:37:30','2013-11-30 15:48:44','93','4','341'),
('6',' Cambridge\'s Competition I ',' Machine Learning',' This one is for intellectuals.','1','2001-10-23 01:37:32','2020-08-16 06:40:54','20','5','309'),
('7',' Harvard\'s Main Challenge V',' Machine Learning',' This one is for experts.','3','2002-06-16 21:30:25','2022-01-11 21:51:30','70','3','424'),
('8',' Spiritful Challenge X','Matrix Calculus',' This one is for the advanced.','4','1986-11-02 16:58:03','2001-01-06 09:18:14','82','4','51'),
('9','The Grand Competition I',' Probability',' This one is for beginners.','4','1979-06-16 03:36:40','1975-07-26 08:45:24','56','3','516'),
('10',' Alexandria\'s Competition',' Programming',' This one is for beginners.','2','1973-10-11 20:38:23','1981-08-16 02:49:27','20','3','519'),
('11',' Stanford Competition',' Databases',' This one is for intellectuals.','1','1987-10-01 20:08:23','1989-03-23 06:27:57','4','3','93'),
('12','Cambridge\'s Competition III',' Thermodynamics',' Time to earn some spirits.','3','1999-02-11 03:50:17','1980-03-23 23:56:31','34','2','119'),
('13',' Cairo\'s Ultimate Competition X',' Probability',' This one is for beginners.','2','1985-03-24 07:22:32','1995-12-19 07:47:14','86','4','175'),
('14',' Spiritful Challenge I',' Thermodynamics',' This one is for intellectuals.','4','1983-05-02 05:29:09','1985-09-19 02:51:22','77','2','89'),
('15',' Hogwarts Competition For Wizards',' Machine Learning',' this competition will leave you mesmerized.','4','2020-10-24 16:22:52','1977-12-21 11:08:29','27','4','421'),
('16',' Stanford Competition II',' Thermodynamics',' This one is for experts.','2','2010-01-21 00:52:11','2002-04-27 12:26:40','50','2','516'),
('17',' Alexandria\'s Grand Challenge','Matrix Calculus',' This one is for experts.','1','1993-04-22 20:31:34','2003-08-08 12:10:24','66','4','123'),
('18',' Spiritful Challenge II',' Programming',' This one is for intellectuals.','4','1976-12-06 10:11:32','2018-11-23 13:03:47','63','4','452'),
('19',' Cairo\'s Challenge XII',' Machine Learning',' This one is for the advanced.','5','1993-08-05 20:10:41','2006-03-06 15:31:04','41','3','107'),
('20',' Cambridge\'s Competition IV',' Machine Learning',' This one is for experts.','2','2008-12-10 14:58:39','2020-08-06 01:49:41','98','5','315');

update dbproject.competition set ENDDATE='2020-5-5 12:00:00' where C_ID > 2 and C_ID < 8;
update dbproject.competition set ENDDATE='2019-12-5 19:00:00' where C_ID > 7 and C_ID < 13;
update dbproject.competition set ENDDATE='2020-10-15 22:00:00' where C_ID > 12 and C_ID < 18;
update dbproject.competition set ENDDATE='2018-5-5 02:00:00' where C_ID > 17 and C_ID < 23;