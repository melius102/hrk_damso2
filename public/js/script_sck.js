let mysock;
let socks = [];
let scMap = new Map();
let sys_color = [192, 192, 192];

function connect_socket(room_no) {
    if (room_no) {
        cht_room_no.innerHTML = `Room No. ${room_no}`;
    } else {
        cht_room_no.innerHTML = `Lobby`;
    }
    if (!mysock) connectToServer();
    else {
        if (mysock.disconnected) mysock.connect();
    }
}

function connectToServer() {
    console.log("try to connect");
    /*
    let host = '192.168.0.11';
    let port = '3000';
    let options = {
        // 'forceNew': true
    };
    let url = "http://" + host + ':' + port;
    let url = "http://" + host;
    mysock = io.connect(url, options);
    */

    // let url = 'https://damso.herokuapp.com';
    // mysock = io.connect(url);
    mysock = io(); // for html from public folder of server

    mysock.on('connect', function () {
        console.log('on connect');
        socks = [];
        addUserList(true, mysock.id, sys_color);

        if (roomNo) { // room: group chatting
            mysock.emit('room', { cmd: 'join', room_no: roomNo });
        } else { // lobby
            mysock.emit('message', {
                id: mysock.id,
                msg: { trans: { flag: false }, src: "join" }, sys: true
            });
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
    mysock.on('message', function (packet) {
        addUserListFromPacket(packet);
        if (packet.room_no && roomNo) { // group chat
            printRoomMsg(packet);
        } else if (!(packet.room_no || roomNo)) { // lobby
            printRoomMsg(packet);
        }
    });

    mysock.on('room', function (packet) {
        if (packet.cmd == "disconnect") {
            console.log("disconnect", packet.id);
            addUserList(false, packet.id);
        } else if (packet.cmd == 'userList') {
            let userList = packet.userList;
            userList.forEach(v => { addUserList(true, v); });
        } else if (packet.cmd == 'messages') {
            // console.log(packet.messages);
            packet.messages.forEach(v => {
                let msg = { trans: {}, src: v.message };
                printMsgHbs(sys_color, msg, "ours", sys_color);
            });
        }
    });

    mysock.on('disconnect', function () {
        console.log('closed');
    });


    // WebRTC
    mysock.on('webrtc', async data => {
        if (data.cmd == 'rtcCall') {
            console.log("on rtcCall");
            console.log("getCalled: ", getCalled);

            if (!getCalled) {
                const confirmed = confirm(
                    `User "id: ${data.from.substring(0, 5)}" wants to call you. Do accept this call?`
                );
                console.log("confirmed: ", confirmed);
                if (!confirmed) {
                    mysock.emit("webrtc", { cmd: "rtcReject", to: data.from });
                    console.log('emit rtcReject');
                    return;
                }
            }

            createPeerConnection({ iceServers: mysock.servers });
            // firstly, need to get offer
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

            await getUserMedia(true);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

            mysock.emit('webrtc', { cmd: "rtcAccept", answer, to: data.from });
            console.log("emit rtcAccept");

            getCalled = true;

            if (!isAlreadyCalling) {
                callUser(data.from);
                isAlreadyCalling = true;
            }
        } else if (data.cmd == 'rtcAccept') {
            console.log("on rtcAccept");
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.cmd == 'rtcReject') {
            console.log("on rtcReject");
            alert(`User: "id: ${data.from.substring(0, 5)}" rejected your call.`);
            closeCall();
        } else if (data.cmd == 'rtcCandidate') {
            console.log("on rtcCandidate");
            try {
                console.log(data.candidate);
                await peerConnection.addIceCandidate(data.candidate);
            } catch (err) {
                console.error(err);
            }
        } else if (data.cmd == 'rtcClose') {
            closeCall();
        } else if (data.cmd == 'rtcServers') {
            mysock.servers = data.rtcServers;
        }
    });
}

function disconnect_socket() {
    if (mysock && mysock.connected) {
        if (roomNo) {
            mysock.emit('room', { cmd: 'leave', room_no: roomNo });
        } else { // lobby
            let packet = {
                id: mysock.id,
                msg: { trans: { flag: false }, src: "leave" },
                sys: true
            };
            mysock.emit('message', packet);
        }
        mysock.disconnect();
    }
}

function printRoomMsg(packet) {
    if (packet.sys) { // system message
        if (packet.msg.src == "join") {
            console.log("enter: ", packet.id);
            // addUserList(true, packet.id);
            let id = packet.id;
            packet.msg.src += ": ";
            printMsgHbs(sys_color, packet.msg, "sysm", scMap.get(id).color, id.substring(0, 5));
        } else if (packet.msg.src == "leave") {
            let id = packet.id;
            packet.msg.src += ": ";
            printMsgHbs(sys_color, packet.msg, "sysm", scMap.get(id) ? scMap.get(id).color : sys_color, id.substring(0, 5));
            console.log("leave: ", packet.id);
            // addUserList(false, packet.id);
        }
    } else if (packet.id && packet.msg.src != "") { // user message
        // addUserList(true, packet.id);
        if (packet.id == mysock.id) printMsgHbs(scMap.get(packet.id).color, packet.msg, "mine", [255, 165, 0]);
        else {
            printMsgHbs(scMap.get(packet.id).color, packet.msg, "ours", scMap.get(packet.id).color);
        }
        console.log('message_packet: ', packet);
    }
}

function addUserListFromPacket(packet) {
    if (packet.sys) { // system message
        if (packet.msg.src == "join") {
            addUserList(true, packet.id);
        } else if (packet.msg.src == "leave") {
            addUserList(false, packet.id);
        }
    } else if (packet.id && packet.msg.src != "") { // user message
        addUserList(true, packet.id);
    }
}

function printMsgHbs(color, msg, user, user_color = sys_color, user_id = "noone") {
    // $('#msg_last').removeAttr('id');
    // plz check security for msg
    // handlebars
    if (user == "sysm") {
        displayMsgHbs({
            user: user,
            color: "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")",
            msg: msg.src,
            user_color: "rgb(" + user_color[0] + "," + user_color[1] + "," + user_color[2] + ")",
            user_id: user_id
        }, hbs_sys_tmpl);
    } else {
        if (msg.trans.flag) {
            displayMsgHbs({
                user: user,
                color: "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")",
                msg_src: msg.src,
                msg_target: msg.target,
                user_color: `rgba(${user_color[0]}, ${user_color[1]}, ${user_color[2]}, 0.5)`
            }, hbs_msg_trans_tmpl);
        } else {
            displayMsgHbs({
                user: user,
                color: "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")",
                msg: msg.src,
                user_color: `rgba(${user_color[0]}, ${user_color[1]}, ${user_color[2]}, 0.5)`
            }, hbs_msg_tmpl);
        }
    }
}

function displayMsgHbs(msg, hbs_tmpl) {
    $('#msg_last').removeAttr('id');
    // method 1
    // let templateUrl = "./hbs/cht_msg.hbs";
    // $.ajax(templateUrl).done(function (data) {
    //     var template = Handlebars.compile(data);
    //     var html_data = template(msg);
    //     $('#cht_msg_win').append(html_data);
    //     location.href = "#msg_last";
    //     cht_input_textarea.focus();
    // });

    // method 2
    var template = Handlebars.compile(hbs_tmpl);
    var html_data = template(msg);
    $('#cht_msg_win').append(html_data);
    let textarea_focus = document.activeElement == document.getElementById("cht_input_textarea");
    // location.href = "#msg_last"; // focus change, r.debug
    window.scrollTo(0, cht_msg_win.scrollHeight);
    if (textarea_focus) cht_input_textarea.focus();
};
