const router = require("express").Router();

router.get('/:id', (req, res) => {
    const errors = [];
    res.render("user-profile", { errors });
});

router.get('/login', (req, res) => {
    const errors = [];
    res.render("login", { errors });
});

router.get('/register', (req, res) => {
    const errors = [];
    res.render("register", { errors });
});

module.exports = router;