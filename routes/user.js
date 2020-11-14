const router = require("express").Router();

router.get('/', (req, res) => {
    res.send("Heyy");
})

module.exports = router;