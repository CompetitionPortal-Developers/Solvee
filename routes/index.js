const router = require("express").Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('home', { errors });
})

module.exports = router;