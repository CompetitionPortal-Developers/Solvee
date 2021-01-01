const router = require("express").Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('home', {
        title: "Competition Portal",
        errors
    });
});

router.get('/donate', (req, res) => {
    const errors = [];
    res.render('donations', {
        title: "Donate",
        style: "donations",
        errors
    });
});

module.exports = router;