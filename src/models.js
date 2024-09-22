const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: String,
  summary: String,
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
