const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const session = require('./session');
const client = require('./mysql');

router.use(session);

router.get('/', function(req,res) {
    res.render('index',{
        title: ejs.render('title'),
        logined: req.session.logined,
        userId: req.session.userId,
    });
});


module.exports = router;