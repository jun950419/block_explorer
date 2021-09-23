const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require('./mysql');
const session = require('./session');
const crypto = require('crypto');

router.use(session);

router.get('/', function(req,res) {
    if(req.session.userId != undefined) {
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Already Login'); location.replace('/');</script>");
    }
    else {
        res.render('signin',{
            title: ejs.render('title'),
            userId: req.session.userId,
            logined : req.session.logined,
        });
    }
});

router.post('/', function(req, res) {
    const body = req.body;
    const cryptoPw = crypto.createHash('sha512').update(body.password).digest('base64');

    if(body.id == null || body.password == null)
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Please enter all fields'); location.replace('/signin');</script>");
    else {
        client.query("select * from users where id=?", [body.id], (error, result) => {
            if(result != "" && result[0].id == body.id && result[0].pw == cryptoPw) {
                req.session.userId = result[0].id;
                req.session.addr = result[0].addr;
                req.session.logined = true;
                req.session.save();
                res.redirect('/');
            }
            else
                res.send("<script language=\"javascript\">alert('[ ERROR ] : ID does not exist OR Wrong password'); location.replace('/signin');</script>");
        });
    }
});

router.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');    
});

module.exports = router;