const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')



// Render index page
router.get('/', (req,res) => {
    res.render("index");
});

module.exports = router