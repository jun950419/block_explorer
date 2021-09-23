const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require('./mysql');
const session = require('./session');
const request = require('request');

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const PORT = 9636;
const ID_STRING = "TimoCoin";
const headers = {
    "content-type": "text/plain;"
};

router.use(session);

router.get('/', function(req,res) {
    if(req.session.userId != undefined) {
        client.query("select id, addr from users", (error, result) => {
                client.query("select * from users where id=?", [req.session.userId], (error, result2) => {
                        res.render('sendfrom',{
                            title: ejs.render('title'),
                            users: result, 
                            logined: req.session.logined,
                            userId: req.session.userId,
                            addr: result2[0].addr,
                        });
                });
        });
    }
    else res.send("<script language=\"javascript\">alert('[ ERROR ] : Please Sign In'); location.replace('/signin');</script>");
});

router.post('/', function(req, res) {
    const account = req.session.userId;
    const coinCount = req.body.coinCount;
    const recvAddr = req.body.recvAddr;
    
    const sendString = `{"jsonrpc": "1.0", "id":"${ID_STRING}", "method": "sendfrom", "params": ["${account}", "${recvAddr}", ${coinCount}]}`;
    const sendOptions = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: sendString
    };
    
    sendCallback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log("================> 코인이 잘 보내졌음");
            res.send("<script language=\"javascript\">alert('[ SUCCESS ] : Send SUCCESS'); location.replace('/sendfrom');</script>");
        }
        else {
            console.log("================> 코인 안 보내짐");
            res.send("<script language=\"javascript\">alert('[ FAIL ] : Send FAIL'); location.replace('/sendfrom');</script>");
        }
    };
    request(sendOptions, sendCallback);

    /* getaccount */
    const accountString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getaccount","params":["${recvAddr}"]}`;
    const accountOptions = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: accountString
    };
    
    accountCallback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const accountData = JSON.parse(body);
            console.log("================> 계정 찾기 성공 ", accountData.result);
        }
        else {
            console.log("================> 계정 찾기 오류");
            res.redirect('/sendfrom');
        }
    };
    request(accountOptions, accountCallback);
});

router.post('/getbalance', (req, res) => {
    const account = req.body.userId;
    const balanceString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getbalance","params":["${account}", 0]}`;
    const balanceOptions = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: balanceString
    };

    balanceCallback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const balanceData = JSON.parse(body);
            // res.send({balance: String(balanceData.result)});
            res.send({balance: balanceData.result});
        }
        else {
            console.log("================> getbalnce 오류");
        }
    };
    request(balanceOptions, balanceCallback);
});

module.exports = router;