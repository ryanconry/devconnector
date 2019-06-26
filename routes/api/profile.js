const express = require("express");
const router = express.Router();

//@route    GET api/profie/test
//@desc     Test profile route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "profile works" }));

module.exports = router;
