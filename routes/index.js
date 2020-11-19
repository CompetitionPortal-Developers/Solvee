const router = require("express").Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('home', { errors });
})

router.get('/competitions', (req, res) => {
    const errors = [];
    res.render('competition', { errors });
})

router.get('/exams', (req, res) => {
    const errors = [];
    res.render('exam', { errors });
})

module.exports = router;