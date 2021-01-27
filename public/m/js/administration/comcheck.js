//默认正序
var order_method = "positive"

function loginFailed() {
	GetComment()
}

function loginSucceeded() {
	GetComment()
}

function GetComment() {
	$.get("/comment/getneedcheck", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			if (data.code == -510) {
				alert('您不是管理员')
				return window.location.href = "/";
			}
			return console.log(data)

		}
		var commentlist = ""
		//按时间排序
		var rows = data.data;
		//order_method = "positive"（正序）
		//"reverse"（倒序）
		if (order_method === "positive") {
			rows.sort(function (a, b) {
				return Date.parse(a.com_send_time) - Date.parse(b.com_send_time);//时间正序
			});
		} else if (order_method === "reverse") {
			rows.sort(function (a, b) {
				return Date.parse(b.com_send_time) - Date.parse(a.com_send_time);//时间倒序
			});
		}

		data = rows;
		commentlist += "<div class='list-item title'><div class='list-item-content'><div class='com-id'>评论id</div><div class='user-infos'>评论用户信息</div><div class='com-send-time'>评论时间</div><div class='com-on-type'>对象</div></div></div>"
		for (var i = 0; i < data.length; i++) {
			var com_send_time = data[i].com_send_time.split(' ')
			if (data[i].com_on_type == 'music') {
				var com_on_type_text = "历史"
			} else if (data[i].com_on_type == 'notice') {
				var com_on_type_text = "公告"
			} else {
				var com_on_type_text = "未知"
			}
			commentlist += "<div class='list-item content list-item-" + data[i].com_id +
				"' id='" + data[i].com_id +
				"'><div class='comment-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(data[i]) +
				"</li><li class='obj com-id'>" + data[i].com_id +
				"</li><li class='obj uid'>" + data[i].uid +
				"</li><li class='obj user'>" + data[i].user +
				"</li><li class='obj com-send-time'>" + data[i].com_send_time +
				"</li><li class='obj com-on-type'>" + data[i].com_on_type +
				"</li><li class='obj com-on-id'>" + data[i].com_on_id +
				"</li><li class='obj com-content'>" + data[i].com_content +
				"</li><li class='obj is-reply'>" + data[i].is_reply +
				"</li><li class='obj reply-to-com-id'>" + data[i].reply_to_com_id +
				"</li><li class='obj reply-to-uid'>" + data[i].reply_to_uid +
				"</li><li class='obj reply-to-user'>" + data[i].reply_to_user +
				"</li><li class='obj reply-to-content'>" + data[i].reply_to_content +
				"</li></ul></div><div class='list-item-content'><div class='com-id'>" + data[i].com_id +
				"</div><div class='user-infos' title='uid:" + data[i].uid + " | 用户名:" + data[i].user + "'>" + data[i].user +
				"</div><div class='com-send-time'><div class='com-send-time-item' id='date'>" + com_send_time[0] +
				"</div><div class='com-send-time-item' id='time'>" + com_send_time[1] +
				"</div></div><div class='com-on-type' title='id:" + data[i].com_on_id + "'>" + com_on_type_text +
				"</div></div>"
			commentlist += "</div>"

		}
		if (data.length == 0) {
			commentlist = "<div class='list-tips-wrap' id='empty'><div class='list-tips-text'>—— 暂无待审核评论 ——</div>"
		}
		$(".list-content").html(commentlist);
	})
}

//排序方式切换
$(document).on('click', '.order-method-wrap', function () {
	if ($(this).find('i').hasClass('fa-sort-numeric-desc')) {
		$(this).find('i').removeClass('fa-sort-numeric-desc')
		$(this).find('i').addClass('fa-sort-numeric-asc')
		order_method = 'positive'
		GetComment()
	} else if ($(this).find('i').hasClass('fa-sort-numeric-asc')) {
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		order_method = 'reverse'
		GetComment()
	}
})

$(document).on('click', '.list-item.content', function () {
	var com_data = JSON.parse($(this).children('.comment-infos').children().children('.data').html())
	var com_id = com_data.com_id;
	var com_on_id = com_data.com_on_id
	var user = com_data.user;
	var uid = com_data.uid;
	var com_send_time = com_data.com_send_time;
	var com_on_type = com_data.com_on_type
	var com_content = com_data.com_content;
	var is_reply = com_data.is_reply
	var reply_to_uid = null;
	if(is_reply == 0){
		var reply_item = "";
	}else if (is_reply == 1){
		reply_to_uid = com_data.reply_to_uid
		var reply_to_user = com_data.reply_to_user
		var reply_to_content = com_data.reply_to_content
		var reply_item = "<p>回复用户：" + reply_to_user + "</p><p>回复内容：" + reply_to_content + "</p>"
	}
	if (com_on_type == 'music') {
		var com_on_type_text = "历史"
	} else if (com_on_type == 'notice') {
		var com_on_type_text = "公告"
	} else {
		var com_on_type_text = "未知"
	}
	var popup_content = ""
	popup_content = "<p>评论id：" + com_id + "</p><p>评论曲目mid：" + com_on_id + "</p><p>评论用户：" + user + "</p><p>评论时间：" + com_send_time + "</p><p>对象：" + com_on_type_text + "</p><p>评论内容：" + com_content + "</p>" + reply_item + "<p class='check-tips'>（点击空白处取消审核）</p>"
	showPopup()
	$('.wrapper-popup .infos').html(popup_content)
	$('.wrapper-popup .btn#ok').html('通过')
	$('.wrapper-popup .btn#ok').attr("onclick", "checkAdopt(" + com_id + "," + uid + "," + reply_to_uid + ")");
	$('.wrapper-popup .btn#cancel').html('不通过')
	$('.wrapper-popup .btn#cancel').attr("onclick", "checkFail(" + com_id + "," + uid + "," + reply_to_uid + ")");
})

/*function showPopup() {
    $('body').append("<div class='wrapper-popup' style='display: none;'><div class='content'><div class='close' onclick='hidePopup()'>×</div><div class='infos'></div><div class='btn-wrap'><button class='btn active' id='cancel' onclick='hidePopup()'>取消</button><button class='btn active' id='ok'>确定</button></div></div></div>");
    $('.wrapper-popup').fadeIn('fast')
}
function hidePopup() {
    $('.wrapper-popup').fadeOut('fast')
    $('.wrapper-popup').remove()
}*/

$('body').on('click', '.wrapper-popup', function () {
	$('.wrapper-popup .content .close').trigger("click");
})
$('.wrapper-popup').on('click', '.content', function (e) {
	e.stopPropagation();
})

function checkAdopt(com_id, uid, reply_to_uid) {
	submitCommentCheck(com_id, uid, reply_to_uid, 1)
	hidePopup()
	GetComment()
}

function checkFail(com_id, uid, reply_to_uid) {
	submitCommentCheck(com_id, uid, reply_to_uid, 0)
	hidePopup()
	GetComment()
}

function submitCommentCheck(com_id, uid, reply_to_uid, visible) {
	var data = {
		com_id: com_id,
		uid: uid,
		reply_to_uid: reply_to_uid,
		visible: visible
	}
	$.ajax({
		url: '/check/comment',
		type: 'post',
		data: data,
		success: function (data, status) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					window.location.reload()
				}
				if (data.code == -510) {
					alert('您不是管理员')
					window.location.href = "/";
				}
				return console.log(data)
			}
			showPopup()
			$('.wrapper-popup .infos').html('审核成功')
			GetComment()
			$('.wrapper-popup .btn#cancel').hide()
			$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup()");
		},
		error: function (data, err) {
			console.log(err);
		}
	})
}