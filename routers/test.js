const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require('./mysql');
const session = require('./session');
const request = require('request');

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const PORT = 9636; // RPCport
const ID_STRING = "TimoCoin";
const headers = {
  "content-type": "text/plain;"
};

router.use(session);

// getblockchaininfo OR getblockcount ==> return block height
// router.get('/', function(req,res) {
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockchaininfo","params":[]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//         //   res.send(data);
//             res.render('test', {
//                 blockHeight: data.result.blocks,
//             })
//             }
//             else console.log("에러");
//         };
//     request(options, callback);
// });


// recent Transaction
// let to = "";
// let from = "";
// let txid = "";
// let blockhash = "";
// let time = 0;
// let fromAddr = ""
// router.get('/', (req, res) => {
//     res.render('test');
// });
// router.post('/', (req, res) => {
//     // ajax 처리
//     const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listtransactions","params":["test1"]}`;
//     const options = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             // console.log(data);
//             // res.render('test', {
//             //     to: data.result[0].account,
//             // })
//             from = data.result[0].account;
//             to = data.result[0].address;
//             txid = data.result[0].txid;
//             blockhash = data.result[0].blockhash;
//             time = data.result[0].time;
//         }
//         else console.log("에러");
//     };
//     request(options, callback);




//     const dataString2 = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getaccountaddress","params":["${from}"]}`;
//     const options2 = {
//         url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
//         method: "POST",
//         headers: headers,
//         body: dataString2
//     };

//     callback = (error, response, body) => {
//         if (!error && response.statusCode == 200) {
//             const data = JSON.parse(body);
//             fromAddr = data.result;
//         }
//         else console.log("에러");
//     };
//     request(options2, callback);


//     console.log(to);
//     console.log(from);
//     console.log(txid);
//     console.log(blockhash);
//     console.log(time);
//     console.log(fromAddr);
// });



// getblockhash
let foundblockhash = "";
router.get('/', (req, res) => {
    res.render('test');
})
router.post("/inp", (req, res) => {
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${req.body.input}]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    };
  
    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            // console.log(data.result);
            foundblockhash = data.result;
        }
    };
    request(options, callback);
    console.log(foundblockhash);
});

// 블록 num으로 검색했을 시
// getblock
// router.get("/getblock/:hash", (req, res) => {
router.get("/getblock", (req, res) => {
    var dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${foundblockhash}"]}`;
    var options = {
      url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
      method: "POST",
      headers: headers,
      body: dataString
    };
  
    callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            // res.send(data);
            console.log("시간", data.result.time);
            console.log("높이", data.result.height);
            console.log("현재 해시", data.result.hash);
            console.log("이전 블록", data.result.previousblockhash);
            console.log("다음 블록", data.result.nextblockhash);
            console.log("블록 사이즈", data.result.size);
            console.log("tx[0]", data.result.tx[0]);
            console.log("tx_length", data.result.tx.length);
        }
    };
    request(options, callback);
  });







module.exports = router;