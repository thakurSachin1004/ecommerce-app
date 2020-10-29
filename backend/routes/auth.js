const express = require("express");
const { createOrUpdateUser, currentUser } = require("../controller/auth");

// middlewares
const { authCheck } = require("../middlewares/auth");

const router = express.Router();

router.post("/current-user", authCheck, currentUser);
router.post("/user/validate", authCheck, createOrUpdateUser);

module.exports = router;
