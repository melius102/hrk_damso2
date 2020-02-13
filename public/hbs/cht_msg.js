let hbs_sys_tmpl = '\
<div id="msg_last" class="cht_msg_box clearfix main_font {{user}}">\
    <img class="cht_msg_img" src="img/blank.svg" style="background-color: {{color}};">\
    <p class="cht_msg_txt">\
        {{msg}} <span style="background-color: {{user_color}};"> {{user_id}} </span>\
    </p>\
</div>';

let hbs_msg_tmpl = '\
<div id="msg_last" class="cht_msg_box clearfix {{user}}">\
    <img class="cht_msg_img" src="img/blank.svg" style="background-color: {{color}};">\
    <p class="cht_msg_txt" style="border-color: {{user_color}};">\
        {{breaklines msg}}\
    </p>\
</div>';

let hbs_msg_trans_tmpl = '\
<div id="msg_last" class="cht_msg_box clearfix {{user}}">\
    <img class="cht_msg_img" src="img/blank.svg" style="background-color: {{color}};">\
    <div class="cht_msg_txt" style="border-color: {{user_color}};">\
        {{breaklines msg_src}} <hr style="border-color: {{user_color}};"/> {{breaklines msg_target}}\
    </div>\
</div>';

let hbs_user_item_tmpl = '\
<div class="user_item clearfix" data-userid="{{user_id}}">\
    <img src="img/blank.svg" style="background-color: {{color}};">\
    <p>{{user_name}}</p>\
</div>';