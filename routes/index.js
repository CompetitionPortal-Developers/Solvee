const router = require("express").Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('home', {
        title: "Competition Portal",
        errors
    });
});

module.exports = router;