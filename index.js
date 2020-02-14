const https = require('https');
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const socketio = require('socket.io');
const cors = require('cors');
const { translation_kakao } = require('./modules/kakao-api');
const { translation_naver } = require('./modules/naver-trans');
const { translation_google } = require('./modules/google-trans');
const { help_text, cmd_list_text } = require('./modules/help-text');

const app = express();
// const router = express.Router();
const port = process.env.PORT || 8080; // for heroku
// const localhost = '192.168.0.64';
const localhost = '120.142.105.239';

app.set('port', port);

app.use(cors());
app.use('/', express.static('./public')); // default: '/' -> index.html
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.send(data);
//     res.sendFile(__dirname + '/public/index.html');
// });

app.get('/users', (req, res) => {
    let data = {
        number: socketids.length,
        ids: socketids
    }
    res.send(data);
});

let server;
if (process.env.PORT) {
    // http server for heroku server
    server = http.createServer(app);
    server.listen(app.get('port'), function () {
        console.log(`HTTP server listening on port ${app.get('port')}`);
    });
} else {
    // https sevrver for local server
    const credentials = {
        key: fs.readFileSync('../../openssl/private.pem'),
        cert: fs.readFileSync('../../openssl/public.pem')
    };
    server = https.createServer(credentials, app);
    server.listen(app.get('port'), function () {
        console.log(`https://${localhost}:${app.get('port')}`);
    });
}

////////////
// socket.io
let socketids = [];
const io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('connection');
    // let packet = { id: socket.id, msg: 'join', sys: true };
    // io.sockets.emit('message', packet);
    // console.log('con info:', socket.request.connection._peername);
    // socket.remoteAddress = socket.request.connection._peername.address;
    // socket.remotePort = socket.request.connection._peername.port;
    // console.log('==conunt==');
    // console.log(io.engine.clientsCount);
    // console.log(Object.keys(io.sockets.connected).length);

    if (!socketids.includes(socket.id)) socketids.push(socket.id);
    console.log('==client array=');
    console.log("ids:", socketids);

    socket.on('disconnect', function () {
        console.log('closed', socket.id);
        socketids.splice(socketids.indexOf(socket.id), 1);
        console.log("left ids:", socketids);
        let send_packet = {
            cmd: 'disconnect',
            id: socket.id
        };
        io.sockets.emit("room", send_packet);
        // let packet = { id: socket.id, msg: 'leave', sys: true }
        // socket.broadcast.emit('message', packet);
        // console.log('==conunt==');
        // console.log(io.engine.clientsCount);
        // console.log(Object.keys(io.sockets.connected).length);
        // console.log("ids:", socketids);
    });

    // room control
    // event: 'room'
    // packet {
    //     cmd: 'join',
    //     room_no: "123"
    // }
    socket.on('room', function (packet) {
        let send_packet = {
            id: socket.id,
            room_no: packet.room_no,
            msg: {
                trans: { flag: false },
                src: packet.cmd
            },
            sys: true
        };

        // packet parser
        if (packet.cmd == 'join') {
            console.log('room join');
            socket.join(packet.room_no);
            console.log("member cnt: ", io.sockets.adapter.rooms[packet.room_no].length); // room member count
            io.sockets.in(packet.room_no).emit('message', send_packet);

            if (packet.room_no) {
                let userList = Object.keys(io.sockets.adapter.rooms[packet.room_no].sockets);
                socket.emit('room', { cmd: 'userList', userList });
            }
        } else if (packet.cmd == 'userList') {
            let userList = Object.keys(io.sockets.adapter.rooms[packet.room_no].sockets);
            socket.emit('room', { cmd: 'userList', userList });
        } else if (packet.cmd == 'leave') {
            console.log('room leave');
            io.sockets.in(packet.room_no).emit('message', send_packet);
            console.log("member cnt: ", io.sockets.adapter.rooms[packet.room_no].length); // room member count
            socket.leave(packet.room_no);
        }
    });

    // sending message
    // event: 'message'
    // packet {
    //     id: socket.id,
    //     room_no: "123",
    //     msg: {trans: {flag: true, src: 'kr', target: 'en'}, src: "join", target: "join" },
    //     sys: true
    // }
    socket.on('message', function (packet) {
        // console.log('on message');

        // textarea cmd
        if (packet.msg.src.substring(0, 4) == TACMD_HEAD) {
            packet.msg.trans.flag = false;
            packet.msg.src = textareaCMDParser(packet.msg.src.substring(4));
            socket.emit('message', packet);
        } else {
            if (packet.msg.trans.flag) {
                translation_machine(packet.msg.trans.src, packet.msg.trans.target, packet.msg.src, function (res_text) {
                    packet.msg.target = res_text;
                    if (packet.room_no) { // room
                        io.sockets.in(packet.room_no).emit('message', packet);
                    } else { // lobby
                        io.sockets.emit('message', packet);
                    }
                });
                console.log('translation...');
            } else {
                if (packet.room_no) { // room
                    io.sockets.in(packet.room_no).emit('message', packet);
                } else { // lobby
                    io.sockets.emit('message', packet);
                    // io.sockets.connected[socket.id].emit('message', msg.msg); // 1:1
                    // socket.broadcast.emit('message', packet);
                    // socket.emit('message', packet); // to self
                    // this.emit('message', 'no id');
                }
            }
        }
    });

    // web RTC control
    // event: 'webrtc'
    socket.on('webrtc', (packet) => {
        let data = { cmd: packet.cmd, from: socket.id };
        if (packet.cmd == 'rtcCall') {
            data.offer = packet.offer;
        } else if (packet.cmd == 'rtcAccept') {
            data.answer = packet.answer;
        } else if (packet.cmd == 'rtcReject') {
        } else if (packet.cmd == 'rtcCandidate') {
            data.candidate = packet.candidate;
        } else if (packet.cmd == 'rtcClose') {
        }
        socket.to(packet.to).emit('webrtc', data);
    }); // end of socket.on('webrtc')
});

let translation_machine = translation_kakao;

// translation_kakao('en', 'kr', 'england', function (res_text) {
//     console.log(res_text);
// });
let TACMD_HEAD = "ds::";

function textareaCMDParser(TACMD) {
    let res = "no effect";
    let cmdarr = TACMD.split(" ");
    switch (cmdarr[0]) {
        case "help":
            if (cmdarr[1] == "--dev") res = cmd_list_text;
            else res = help_text;
            break;
        case "change":
            if (cmdarr[1] == "kakao") {
                translation_machine = translation_kakao;
                res = "change to kakao";
            } else if (cmdarr[1] == "naver") {
                translation_machine = translation_naver;
                res = "change to naver";
            } else if (cmdarr[1] == "google") {
                translation_machine = translation_google;
                res = "change to google";
            }
            break;
        default:
            res = "bad command";
            break;
    }
    return res;
}
