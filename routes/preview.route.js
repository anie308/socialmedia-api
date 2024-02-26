const router = require("express").Router();
const path = require("path")
const htmlFilePath = path.join(__dirname, 'index.html');

router.get("", (req, res) => {
    // res.send("Welcome to the talebook API");
    res.sendFile(htmlFilePath);
});

module.exports = router;