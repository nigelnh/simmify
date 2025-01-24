const express = require("express");
const { summarizeContent } = require("./controllers");

const router = express.Router();

router.post("/summarize", summarizeContent);

module.exports = router;
