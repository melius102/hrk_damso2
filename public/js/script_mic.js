let stateUserList = false;
let stateMicIcon = 0;
let targetRTC;

function toggleUserList() {
    if (arguments[0] === undefined) stateUserList = !stateUserList;
    else stateUserList = arguments[0];
    document.documentElement.style.setProperty('--window_height', `${$(window).height()}px`);
    if (stateUserList) { // on
        $("#cht_user_list").css({ right: 0 });
    } else { // off
        $("#cht_user_list").css({ right: 'calc(var(--temp_width) * -1)' });
    }
}

function micIconDisplay(state) {
    stateMicIcon = state;
    if (state == 0) { // user media off
        $("#cht_input_mic>i").css({ opacity: 0.3, color: '#eee' });
    } else if (state == 1) { // user media on
        $("#cht_input_mic>i").css({ opacity: 1, color: '#eee' });
    } else if (state == 2) { // in the call
        $("#cht_input_mic>i").css({ opacity: 1, color: 'red' });
    }
}

function addUserList(flag, id, color) {
    // add userList
    if (flag) { // add
        if (!socks.includes(id)) {
            socks.push(id);
            if (!color) color = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
            scMap.set(id, { color: color });
        }
    } else { // remove
        if (socks.includes(id)) {
            let index = socks.indexOf(id);
            let delSock = socks.splice(index, 1);
            scMap.delete(id);
            console.log("delete: ", delSock);
            console.log("left: ", socks);
        }
    }

    // make userList UI
    $('#user_list_box').empty();
    socks.forEach(v => {
        if (v !== mysock.id && !roomNo) return;
        let color = scMap.get(v).color;
        showUsersHbs({
            color: "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")",
            user_id: v,
            user_name: v.substring(0, 5)
        }, hbs_user_item_tmpl);
    });
}

function showUsersHbs(user, hbs_tmpl) {
    let template = Handlebars.compile(hbs_tmpl);
    let html_data = template(user);
    $('#user_list_box').append(html_data);
    $('#user_list_box').children().last().click(async function (evt) {
        if ($(this).data("userid") != mysock.id) {
            createPeerConnection({ iceServers: mysock.servers });

            await getUserMedia(true);
            micIconDisplay(1);

            let target = $(this).data("userid")
            console.log('call ' + target);
            getCalled = true;
            isAlreadyCalling = true;
            callUser(target);
        }
    });
};


let peerConnection;

async function createPeerConnection(configuration) {
    if (peerConnection) return;

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = function (evt) {
        console.log('on icecandidate');
        if (evt.candidate) {
            let candidate = evt.candidate;
            mysock.emit("webrtc", { cmd: "rtcCandidate", candidate, to: targetRTC });
            console.log("emit rtcCandidate");
            console.log(candidate);
        }
    }

    peerConnection.ontrack = function ({ streams: [stream] }) {
        console.log('on track');
        micIconDisplay(2);
        remote_audio.srcObject = stream;
    };

    peerConnection.onsignalingstatechange = function () {
        if (!peerConnection) return;
        console.log('on signalingstatechange', peerConnection.signalingState);
        switch (peerConnection.signalingState) {
            case "closed":
                closeCall();
                break;
        }
    };

    peerConnection.oniceconnectionstatechange = function () {
        if (!peerConnection) return;
        console.log('on iceconnectionstatechange', peerConnection.iceConnectionState);
        switch (peerConnection.iceConnectionState) {
            case "closed":
            case "failed":
            case "disconnected":
                closeCall();
                break;
        }
    };
}

let mediaStream;
let isAlreadyCalling = false;
let getCalled = false;

async function getUserMedia(flag) {
    if (flag) { // on
        if (navigator.mediaDevices) {
            if (!mediaStream) {
                console.log('UserMedia On');
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                mediaStream = stream;

                // let audioContext = new window.AudioContext();
                // let audioInput = audioContext.createMediaStreamSource(stream);
                // let gainNode = audioContext.createGain();
                // gainNode.gain.value = 0.0;
                // audioInput.connect(gainNode);
                // gainNode.connect(audioContext.destination);

                local_audio.srcObject = stream;
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            }
        } else { alert("Your browser does not support UserMedia."); }
    } else { // off
        if (mediaStream) {
            console.log('UserMedia Off');
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }
}

async function callUser(socketId) {
    targetRTC = socketId;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    mysock.emit("webrtc", { cmd: "rtcCall", offer, to: socketId });
    console.log("emit rtcCall");
}

function closeCall(send) {
    getUserMedia(false);
    micIconDisplay(0);
    peerConnection.close();
    peerConnection = null;
    isAlreadyCalling = false;
    getCalled = false;

    if (send) {
        mysock.emit("webrtc", { cmd: "rtcClose", to: targetRTC });
    }
}