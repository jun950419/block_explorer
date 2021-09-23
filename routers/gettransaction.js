const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const session = require('./session');
const request = require('request');

router.use(session);

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const PORT = 9636; // RPCport
const ID_STRING = "TimoCoin";
const headers = {
  "content-type": "text/plain;"
};

router.use(session);

router.get('/:txid', (req,res) => {
    // console.log(req.params.txid);
    res.render('gettransaction',{
        logined: req.session.logined,
        userId: req.session.userId,
        txid: req.params.txid,
    });
});




module.exports = router;