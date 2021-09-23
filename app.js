const http = require('http'); // http 서비스
const express = require('express'); // express로 프로젝트 제작 express-generator 사용안함
const bodyParser = require('body-parser'); // 데이터 변환
const path = require('path'); // 패치하기
const ejs = require('ejs'); // ejs 사용
const request = require('request'); // 요청데이터 처리
const dotenv = require("dotenv"); // 환경변수 .env사용
const session = require('./routers/session'); // 세션 설정
const moment = require('moment');

dotenv.config(); //  dotenv 적용
// moment.locale('ko'); //moment 한국어

// express 연결
const app = express();
const server = http.createServer(app);

app.use(session); //세션 사용

// bodyParser 데이터 안깨지기 위한 설정
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// const indexRouter = require('./routers/index');
const signupRouter = require('./routers/signup');
const signinRouter = require('./routers/signin');
const sendfromRouter = require('./routers/sendfrom');
// app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/signin', signinRouter);
app.use('/sendfrom', sendfromRouter);

// 호스트와 포트 설정
const hostname = '127.0.0.1'; // 로컬 호스트
const port = 3001; // node.js 포트 설정

// 블록체인 qt 설정
const USER = "minki"; // 연결 아이디
const PASS = 1234; // 연결 비번
const PORT = 9636;
const ID_STRING = "minki"; // 해당 아이디 (로그인 시 그 아이디 적용)
const headers = {
    "content-type": "text/plain;"
}; // 해당 데이터 타입 설정

// ejs 설정 및 디렉토리 경로 설정
app.set('view engine', 'ejs'); // ejs 모듈 사용
app.set('views', './views'); // views 폴더 설정
app.use(express.static(path.join(__dirname, 'routes'))); // routes 폴더 설정
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더 설정

function Unix_timestamp(t){
    t = Number(t);
    var date = new Date(t*1000);
    var hour = date.getHours()-9;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return hour == 0 ? minute == 0 ? second + 's' : minute + '.' + second + 'm' : hour + '.' + minute + 'h';
}

function Unix_timestamp_lower(t){
    t = Number(t);
    var date = new Date(t*1000);
    var year = date.getFullYear();
    var month = "0" + (date.getMonth()+1);
    var day = "0" + date.getDate();
    var hour = "0" + date.getHours();
    var minute = "0" + date.getMinutes();
    var second = "0" + date.getSeconds();
    return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2);
}

// 처음 시작시 렌더링 되는 곳
app.get('/', function(req,res,next){
    const da = [];
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockchaininfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            da.push(data);
            req.datas = da;
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req,res,next){
    let time_sum = 0;
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"listtransactions","params":[]}`;
    const options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if(error) console.log(error);
        if(!error && response.statusCode == 200){
            const data = JSON.parse(body); // Object로 나옴
            for(let i = 9; i > 0; i--){
                time_sum += data.result[i].blocktime - data.result[i-1].blocktime;
            }
            req.blocktime = time_sum / 10;
            req.datas.push(data);
            next();
        }
    };
    request(options, callback);
});
app.get('/', function(req, res, next){
    res.render('index',{
        title : ejs.render('title'),
        logined : req.session.logined,
        userId : req.session.userId,
        getblockchaininfo : req.datas[0].result,
        getnetworkinfo : req.datas[1].result,
        getmininginfo : req.datas[2].result,
        difficulty : Math.round(req.datas[0].result.difficulty * 100000)/100000,
        moment: moment
    });
});
app.get('/block_transaction', function (req, res, next) {
    const list = [];
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockcount","params":[]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            const num = Number(data.result)-19;
            // list.push(data.result);
            // data.result => 1351
            // for문 위치
            let result_num = Number(data.result);
            for(let i = result_num; i > result_num-20; i--){
                options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${i}]}`;
                callback1 = (error, response, body) => {
                    if (error) console.log(error);
                    if (!error && response.statusCode == 200) {
                        data = JSON.parse(body);
                        // _data.result => blockhash
                        options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${data.result}"]}`;
                        callback2 = (error, response, body) => {
                            if (error) console.log(error);
                            if (!error && response.statusCode == 200) {
                                data = JSON.parse(body);
                                // data.result.tx
                                options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getrawtransaction","params":["${data.result.tx[data.result.tx.length-1]}", true]}`;
                                callback3 = (error, response, body) => {
                                    if (error) console.log(error);
                                    if (!error && response.statusCode == 200) {
                                        data = JSON.parse(body);
                                        data.result.mo_time = moment(Unix_timestamp_lower(data.result.blocktime)).startOf('sec').fromNow();
                                        data.result.blockheight = i;
                                        data.result.amount = data.result.vout[0].value > data.result.vout[1].value ? data.result.vout[0].value : data.result.vout[1].value;
                                        list.push(data.result);
                                        if(i == num) {
                                            let sort_list;
                                            sort_list = list.sort((a,b) => {
                                                return b.blockheight - a.blockheight;
                                            })
                                            let sum = 0;
                                            for(let i = 0; i< 9; i++) {  
                                                if(sort_list[i+1] != undefined) sum += Number(sort_list[i].blocktime) - Number(sort_list[i+1].blocktime);
                                            }
                                            avg_time = Unix_timestamp(sum/10);
                                            res.send({sort_list, avg_time});
                                        }
                                    }
                                }
                                request(options, callback3);
                            }
                        }
                        request(options, callback2);
                    }
                }
                request(options, callback1);
            }
        }
    }
    request(options, callback);
});

app.get('/block_interval', function (req, res, next) {
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getmininginfo","params":[]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body); // Object로 나옴
            options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getnetworkinfo","params":[]}`;
            callback = (error, response, body) => {
                if (error) console.log(error);
                if (!error && response.statusCode == 200) {
                    const _data = JSON.parse(body); // Object로 나옴   
                    data.result.difficulty = Math.round(data.result.difficulty * 100000)/100000 
                    data.result.connections = _data.result.connections;
                    res.send(data.result);
                }
            };
            request(options, callback);
        }
    };
    request(options, callback);
});


app.get("/getrawtransaction/:hex/:hash/:time", function (req, res,next) {
    const hex = req.params.hex;
    const hash = req.params.hash;
    const time = req.params.time;
    // console.log('blockhash',hash)
    // console.log("hex",hex);
      const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"decoderawtransaction","params":["${hex}"]}`;
      const options = {
          url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
          method: "POST",
          headers: headers,
          body: dataString
      }
      callback = (error, response, body) => {
          if(error) console.log(error);
          console.log('실행');
          if(!error && response.statusCode == 200){
              let data = JSON.parse(body); // Object로 나옴
            console.log('data',data)
            console.log('sss',data.result)
              res.render('getrawtransaction',{
                  data : data.result,
                  hash : hash,
                  hex : hex,
                  time : time,
                  logined : req.session.logined,
                  title : ejs.render('title')
              });
              // res.send(data);
          }
      };
      request(options, callback);
  })


////////////검색///////////////
app.post('/search', function(req, res) {
    const blocknum = req.body.block_num;
    const dataString = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblockhash","params":[${blocknum}]}`;
    let options = {
        url: `http://${USER}:${PASS}@127.0.0.1:${PORT}/`,
        method: "POST",
        headers: headers,
        body: dataString
    }
    let search_result;
    callback = (error, response, body) => {
        if (error) console.log(error);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body); // Object로 나옴
            options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getblock","params":["${data.result}"]}`;
            callback1 = (error, response, body) => {
                if (error) console.log(error);
                if (!error && response.statusCode == 200) {
                    data = JSON.parse(body);
                    search_result = data.result;
                    options.body = `{"jsonrpc":"1.0","id":"${ID_STRING}","method":"getrawtransaction","params":["${search_result.tx[search_result.tx.length - 1]}", true]}`;
                    callback2 = (error, response, body) => {
                        if (error) console.log(error);
                        if (!error && response.statusCode == 200) {
                            data = JSON.parse(body);
                            search_result.amount = data.result.vout[0].value > data.result.vout[1].value ? data.result.vout[0].value : data.result.vout[1].value;
                            res.render('search',{
                                block_info : search_result,
                                title : ejs.render('title'),
                                logined : req.session.logined,
                            })
                        }
                    }
                    request(options, callback2);
                }
            }
            request(options, callback1);
        }
    }
    request(options, callback);
})

// exchange 클릭시 mincho 거래소 ejs 렌더링
app.get('/exchange', function(req,res){
    res.render('exchange',{
        title : ejs.render('title'),
        logined : req.session.logined,
    });
});

// 서버 연결 상태 확인
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});