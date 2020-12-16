const router = require("express").Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('home', { errors });
})

router.get('/competitions', (req, res) => {
    const errors = [];
    const competitions = [
        {
            c_id: 1,
            title: "C++ Algorithms Challenge",
            category: "Computer Science",
            descp: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            rating: Math.ceil(3.4),
            startDate: "7/10/2020 18:00",
            endDate: "9/10/2020 18:00"
        },
        {
            c_id: 2,
            title: "SQL Queries Challenge",
            category: "Computer Science",
            descp: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            rating: Math.ceil(0),
            startDate: "20/2/2020 9:00",
            endDate: "22/2/2020 9:00"
        }
    ]
    res.render('competition', { errors, competitions });
})

router.get('/exams', (req, res) => {
    const errors = [];
    const exams = [
        {
            e_id: 1,
            title: "OOP Lecture 4 Quiz",
            e_subject: "Programming Techniques",
            descp: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            duration: 15,
            startDate: "7/10/2020 18:00",
            endDate: "9/10/2020 18:00"
        },
        {
            e_id: 2,
            title: "Electronics Exam",
            e_subject: "Electronics",
            descp: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            duration: 45,
            startDate: "20/2/2020 9:00",
            endDate: "22/2/2020 9:00"
        }
    ]
    res.render('exam', { errors, exams });
})

module.exports = router;