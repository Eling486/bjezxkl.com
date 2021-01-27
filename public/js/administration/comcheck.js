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
		commentlist += "<div class='list-item title'><div class='list-item-content'><div class='com-id'>评论id</div><div class='user-infos'>评论用户信息</div><div class='com-send-time'>评论时间</div><div class='com-on-type'>对象</div><div class='com-content'>评论内容</div><div class='reply-to-user'>回复用户</div><div class='reply-to-content'>回复内容</div></div><div class='check-wrap'>审核选项</div></div>"
		for (var i = 0; i < data.length; i++) {
			var com_send_time = data[i].com_send_time.split(' ')
			if (data[i].com_on_type == 'music') {
				var com_on_type_text = "历史"
			} else if (data[i].com_on_type == 'notice') {
				var com_on_type_text = "公告"
			} else {
				var com_on_type_text = "未知"
			}
			commentlist += "<div class='list-item list-item-" + data[i].com_id +
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
				"</div><div class='com-content' title='" + data[i].com_content + "'>" + data[i].com_content +
				"</div><div class='reply-to-user' title='uid:" + data[i].reply_to_uid + " | 用户名:" + data[i].reply_to_user + "'>" + data[i].reply_to_user +
				"</div><div class='reply-to-content' title='" + data[i].reply_to_content + "'>" + data[i].reply_to_content +
				"</div></div><div class='check-wrap'><span class='option' id='adopt'>通过</span><span class='option' id='fail'>不通过</span></div>"
			commentlist += "</div >"

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

$(document).on('click', '.check-wrap .option', function () {
	var check_result = $(this).attr("id");
	var com_id = $(this).parent().siblings('.comment-infos').children().children('.obj.com-id').html()
	var uid = $(this).parent().siblings('.comment-infos').children().children('.obj.uid').html()
	var reply_to_uid = $(this).parent().siblings('.comment-infos').children().children('.obj.reply-to-uid').html()
	if (check_result == "adopt") {
		showPopup()
		$('.wrapper-popup .infos').html('是否确定该评论审核 <b>通过</b>')
		$('.wrapper-popup .btn#ok').attr("onclick", "checkAdopt(" + com_id + "," + uid + "," + reply_to_uid + ")");
	} else if (check_result == 'fail') {
		showPopup()
		$('.wrapper-popup .infos').html('是否确定该评论审核 <b>不通过</b>')
		$('.wrapper-popup .btn#ok').attr("onclick", "checkFail(" + com_id + "," + uid + "," + reply_to_uid + ")");
	}
})

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