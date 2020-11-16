const router = require("express").Router();

router.get('/login', (req, res) => {
    const errors=[];
    res.render("login",{errors});
})

module.exports = router;