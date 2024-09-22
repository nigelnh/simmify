const express = require('express');
const { summarizeContent, getPreviousLinks } = require('./controllers');

const router = express.Router();

router.post('/summarize', summarizeContent);
router.get('/links', getPreviousLinks);

module.exports = router;
