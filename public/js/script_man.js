const viewportParams2 = ", initial-scale=1.0, user-scalable=no";
let metaViewport;
let cur_w, cur_h, new_w, new_h, start_angle;
let desktop = false;
let rdev = false;

// function getWinInner() {
//     let win_inner_ = [window.innerWidth, window.innerHeight];
//     let jquerywin_ = [$(window).width(), $(window).height()];
// }

function getViewport() {
    new_w = $(window).width();
    new_h = $(window).height();
}

function updateViewport(new_w, new_h, css_flg) {
    cur_w = new_w;
    cur_h = new_h;

    let viewportParams = "width=" + cur_w + ", height=" + cur_h + viewportParams2;
    metaViewport.setAttribute("content", viewportParams);

    if (css_flg) {
        // document.documentElement.style.setProperty('--varw', `${cur_w}px`);
        document.documentElement.style.setProperty('--varh', `${cur_h / 100}px`);
    }
}

function orientation_angle() {
    let angle = 0;
    if (window.screen.orientation) {
        angle = window.screen.orientation.angle;
    }
    else if (window.orientation) {
        angle = window.orientation;
    }
    return angle;
};

// https://gist.github.com/BashCloud/2feb9975fa0fb0620ba030857f4f8fe6
function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function isDesktop() {
    let result = false;
    if (window.screen.orientation) {
        if (start_angle == 0 && window.screen.orientation.type == "landscape-primary") {
            result = true;
        }
    } else {
        result = !(isMobile());
    }
    return result;
}

window.onload = function () {
    metaViewport = document.querySelector("meta[name=viewport]");
    document.documentElement.style.setProperty('--intro_time', `5s`);
    if (rdev) document.documentElement.style.setProperty('--intro_time', `0s`);
    document.documentElement.style.setProperty('--input_height', `50px`);

    // alert(screen.orientation.type);
    // portrait-primary, landscape-primary, landscape-secondary
    // alert(screen.orientation.angle);
    // 0, 90, 270, (number)
    start_angle = orientation_angle();
    desktop = isDesktop();
    initialization_log();
    initialization_cht();
    if (rdev) log_btn_enter.onclick();
};

window.onresize = function () {
    if (start_angle == 0) {
        if (orientation_angle() == 0) {
            hideViewport(false);
        } else {
            hideViewport(true);
        }
    } else {
        if (orientation_angle() == 0) {
            window.onload();
        }
    }
};

function hideViewport(flag) {
    if (flag) {
        log_wrap.style.visibility = "hidden";
    } else {
        log_wrap.style.visibility = "visible";
    }
}

function initialization_log() {
    if (start_angle == 0) { // all for desktop & portrait for mobile
        hideViewport(false);
        getViewport();
        updateViewport(new_w, new_h, true);
    } else { // landscape
        hideViewport(true);
    }

    log_btn_enter.onclick = function () {
        log_wrap.style.display = "none";
        cht_wrap.style.display = "block";

        // updateTextarea method 2
        font_height = cht_input_textarea.scrollHeight;
        cht_input_textarea.setAttribute('style', 'height:' + cht_input_textarea.scrollHeight);

        document.documentElement.style.setProperty('--intro_time', `0s`);
        updateViewport("device-width", "device-height", false);
        connect_socket(log_input_room.value);
        log_input_room.value = "";

        // if (rdev) toggleUserList();
    };

    $('#log_input_room').on('input', function () {
        if (log_input_room.value) {
            log_btn_enter.innerHTML = "Enter Room";
        } else {
            log_btn_enter.innerHTML = "Enter Lobby";
        }
    });
}

function initialization_cht() {
    cht_input_plus.onclick = function () {
        toggle1stInputBtn();
        toggle2stInputBtn(false);
        toggleUserList(false);
    };

    init_cht_menu();

    // handlebars helper
    Handlebars.registerHelper('breaklines', function (text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        text = text.replace(/( )/gm, '&nbsp;');
        return new Handlebars.SafeString(text);
    });

    let cnt = 0;
    cht_input_send.onclick = function () {
        cht_input_textarea.focus();
        if (!mysock || mysock.disconnected || cht_input_textarea.value == "") return;

        // let msg = cht_input_textarea.value.replace(/\n/g, "<br/>");
        let msg = cht_input_textarea.value;

        // sending message
        // event: 'message'
        // packet {
        //     id: socket.id,
        //     room_no: "123",
        //     msg: {trans: {flag: true, src: 'kr', target: 'en'}, src: "join", target: "join" },
        //     sys: true
        // }
        // send socket
        mysock.emit('message', {
            id: mysock.id,
            room_no: roomNo,
            msg: {
                trans: transObj,
                src: msg
            }
        });

        // print on html
        // if (msg != "") { cnt++; printMsgHbs(scMap.get(mysock.id).color, msg, "mine", [255, 165, 0]); // focus change }
        cht_input_textarea.value = "";
        updateTextarea();
        // if (rdev) cht_input_textarea.value = "test_msg";
    };

    // $('#cht_input_textarea').on("propertychange change keyup paste input", function() {
    // input, keyup, paste
    $('#cht_input_textarea').on("input", updateTextarea);
    $('#cht_input_textarea').on("focus", function () {
        console.log("focus");
        toggle1stInputBtn(false);
        toggle2stInputBtn(false);
        toggleUserList(false);
    });

    if (desktop) {
        $(document).on('keydown', function (e) {
            if (e.key == "Enter" && e.shiftKey == false) {
                e.preventDefault();
                cht_input_send.onclick();
            }
        });
    }
};


// kakao
// 'kr', 'en', 'jp', 'cn', 'vi', 'id', 'ar'
// 'bn', 'de', 'es', 'fr', 'hi', 'it'
// 'ms', 'nl', 'pt', 'ru', 'th', 'tr'
langList = ['kr', 'en', 'jp', 'cn', 'hi', 'ar'];

function init_cht_menu() {
    // cht_room_no.onclick = function () {}
    cht_input_out.onclick = function () {
        log_wrap.style.display = "block";
        cht_wrap.style.display = "none";
        disconnect_socket();
        clearMsgWin();
        toggle1stInputBtn(false);
        toggle2stInputBtn(false);
        toggleUserList(false);
    };

    cht_input_trans.onclick = function () {
        toggleTransBtn();
        // toggle1stInputBtn();
    }

    cht_input_mic.onclick = () => {
        if (stateMicIcon == 0) toggleUserList();
        else if (stateMicIcon == 2) closeCall(true);
    };

    // let tid;
    cht_input_file.onclick = function () {
        // console.log("click file");
        // if (tid) {
        //     clearInterval(tid);
        //     tid = undefined;
        // } else {
        //     let tmp_color = [249, 30, 40];
        //     let tmp_msg = {
        //         trans: {
        //             flag: false,
        //             src: "kr",
        //             target: "en"
        //         },
        //         src: "rcode"
        //     };
        //     tid = setInterval(() => {
        //         printMsgHbs(tmp_color, tmp_msg, "ours", tmp_color);
        //     }, 500);
        // }
    }

    cht_input_btn21.onclick = function () {
        if (menu2_Type == "trans") {
            let index = langList.indexOf(transObj.src);
            if (!langList[++index]) index = 0;
            transObj.src = langList[index];
            $(this).children().text(transObj.src);
        }
    }

    cht_input_btn22.onclick = function () {
        if (menu2_Type == "trans") {
            let index = langList.indexOf(transObj.target);
            if (!langList[++index]) index = 0;
            transObj.target = langList[index];
            $(this).children().text(transObj.target);
        }
    }

    cht_input_btn23.onclick = function () { }

    if (!transObj.flag) {
        $('#cht_btn_grp1 #cht_input_trans p').css("opacity", 0.3);
    }
    micIconDisplay(0);
}

let cht_input_plus_flag = true;
let menu2_Type;

function toggle1stInputBtn() {
    let that = document.getElementById('cht_input_plus');
    let right;

    if (arguments[0] == !cht_input_plus_flag) return;

    if (cht_input_plus_flag) {
        that.src = "img/Icon awesome-minus-square.svg";
        cht_input_plus_flag = false;
        right = 0;
        $("#cht_btn_grp1").stop().fadeIn(1000);
    } else {
        that.src = "img/Icon awesome-plus-square.svg";
        cht_input_plus_flag = true;
        right = -300;
        $("#cht_btn_grp1").stop().fadeOut(1000);
    }
    document.documentElement.style.setProperty('--btn1_right', `${right}px`);
}

function toggle2stInputBtn(flag) {
    switch (menu2_Type) {
        case "trans":
            let right;
            //$(".cht_input_btn2:not(:nth-of-type(6)) p").text(transObj.src);
            $("#cht_input_btn21 p").text(transObj.src);
            $("#cht_input_btn22 p").text(transObj.target);
            if (flag) {
                right = 0;
                $("#cht_btn_grp2").stop().fadeIn(1000);
            } else {
                right = -300;
                $("#cht_btn_grp2").stop().fadeOut(1000);
            }
            document.documentElement.style.setProperty('--btn2_right', `${right}px`);
            cht_input_btn23.style.visibility = "hidden"; // "visible"
            break;
        default:
            break;
    }

    // if (cht_input_plus_flag) {
    //     cht_input_plus_flag = false;
    //     right = 0;
    //     $(".cht_input_btn").stop().fadeIn(1000);
    // } else {
    //     cht_input_plus_flag = true;
    //     right = -220;
    //     $(".cht_input_btn").stop().fadeOut(1000);
    // }
    // document.documentElement.style.setProperty('--btn2_right', `${right}px`);
}

let transObj = {
    flag: false,
    src: 'kr',
    target: 'en'
};

function toggleTransBtn() {
    menu2_Type = "trans";
    if (transObj.flag) {
        $("#cht_input_trans>p").css({
            opacity: 0.3
        });
        transObj.flag = false;
        toggle2stInputBtn(transObj.flag);
    } else {
        $("#cht_input_trans>p").css({
            opacity: 1
        });
        transObj.flag = true;
        toggle2stInputBtn(transObj.flag);
    }
}


let font_height = 21; // for font-size: 16px
// method 1
// function updateTextarea() {
//     let line_num = cht_input_textarea.value.split('\n').length;
//     let input_height;
//     let textarea_height;
//     if (line_num < 2) {
//         textarea_height = font_height;
//         input_height = textarea_height + 29;
//     } else if (line_num < 4) {
//         textarea_height = font_height * line_num;
//         input_height = textarea_height + 29;
//     } else {
//         textarea_height = font_height * 4;
//         input_height = textarea_height + 29;
//     }
//     cht_input_textarea.style.height = `${textarea_height}px`;
//     document.documentElement.style.setProperty('--input_height', `${input_height}px`);
//     return true;
// }

// method 2
function updateTextarea() {
    let textarea_height = cht_input_textarea.scrollHeight;
    let line_num = textarea_height / font_height;

    if (line_num < 5) {
        cht_input_textarea.style.height = 'auto';
        // console.log('cht_input_textarea.scrollHeight', cht_input_textarea.scrollHeight);
        cht_input_textarea.style.height = `${cht_input_textarea.scrollHeight}px`;
        textarea_height = cht_input_textarea.scrollHeight;
        let input_height = textarea_height + 29;
        document.documentElement.style.setProperty('--input_height', `${input_height}px`);
    }
}

function clearMsgWin() {
    $('#cht_msg_win').empty();
}