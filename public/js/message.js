
function loginFailed() {
	pageLoaded()
}

function loginSucceeded() {
	pageLoaded()
}

function pageLoaded(){
	$.get("/user/remind", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return window.location.href='/'
			}
			return console.log(data)
		}
		var hash = window.location.hash.split("/")[1]
		getMsg(hash)
	})
}

function hashChanged(){
	$.get("/user/remind", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(data)
		}
		$(".message-content .list").html("<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i>")
		var hash = window.location.hash.split("/")[1]
		getMsg(hash)
	})
}

function refleshRemind(){
	$.get("/user/remind", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(data)
		}
		var new_like_num = data.data[0].new_like_num
		var new_comment_num = data.data[0].new_comment_num
		var unread_msg_num = data.data[0].unread_msg_num
		var unread_system_num = data.data[0].unread_system_num
		if(new_like_num == 0){
			new_like_num = "";
		}else if(new_like_num > 99){
			new_like_num = "99+"
		}
		if(new_comment_num == 0){
			new_comment_num = "";
		}else if(new_comment_num > 99){
			new_comment_num = "99+"
		}
		if(unread_msg_num == 0){
			unread_msg_num = "";
		}else if(unread_msg_num > 99){
			unread_msg_num = "99+"
		}
		if(unread_system_num == 0){
			unread_system_num = "";
		}else if(unread_system_num > 99){
			unread_system_num = "99+"
		}
		$(".message-sidebar .list .list-item .remind#system").html(unread_system_num)
		$(".message-sidebar .list .list-item .remind#message").html(unread_msg_num)
		$(".message-sidebar .list .list-item .remind#like").html(new_like_num)
		$(".message-sidebar .list .list-item .remind#comment").html(new_comment_num)
	})
}

function getMsg(type){
	if(!type){
		var type = "auto"
	}else{
		var type = type;
	}
	if(type == "auto"){
		$.get("/user/remind", function (data, err) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				return console.log(data)
			}
			var new_like_num = data.data[0].new_like_num
			var new_comment_num = data.data[0].new_comment_num
			var unread_msg_num = data.data[0].unread_msg_num
			var unread_system_num = data.data[0].unread_system_num
			type = ""
			if(new_like_num > new_comment_num){
				type = "like"
			}
			if(unread_msg_num > new_like_num){
				type = "msg"
			}
			if(unread_system_num > unread_msg_num){
				type = "system"
			}
			if(new_comment_num > unread_system_num){
				type = "comment"
			}
			if(new_like_num == 0 && new_comment_num == 0 && unread_msg_num == 0 && unread_system_num == 0){
				type ="system"
			}
			refleshMsg(type)
		})
	}else{
		refleshMsg(type)
	}
}

function refleshMsg(type){
	window.location.hash = "/" + type
	$.get("/message/getmsg?type=" + type, function (result, err) {
		if (result.code !== 0) {
			if (result.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(result)
		}
		
		var msg_content = ""
		if(type == "system"){
			var rows = result.data
			rows.sort(function (a, b) {
				return Date.parse(b.msg_send_time) - Date.parse(a.msg_send_time);//时间倒序
			});
			data = rows;
			for(var i = 0; i < data.length; i++){
				msg_content += "<div class='list-item system' id='" + data[i].msg_id +
				"'><div class='msg-title'>" + data[i].msg_send_user + 
				"</div><div class='msg-content'>" + data[i].msg_content + 
				"</div></div>"
			}
			if(msg_content == ""){
				msg_content = "<div class='list-empty'>你还没有收到过系统消息哟~</div>"
			}
			$(".message-sidebar .list .list-item").removeClass("active")
			$(".message-sidebar .list .list-item#" + type + "").addClass("active")
			$(".message-content .title").html("系统消息")
			$(".message-content .list").html(msg_content)
			refreshHeader()
			return refleshRemind()
		}
		if(type == "like"){
			var rows = result.data
			rows.sort(function (a, b) {
				return Date.parse(b.like_time) - Date.parse(a.like_time);//时间倒序
			});
			data = rows;
			for(var i = 0; i < data.length; i++){
				msg_content += "<div class='list-item like' id='" + data[i].msg_id + "'><p class='like-text'><span class='like-user'>" + data[i].like_user + "</span> 赞了你的评论，<a class='link-mid' href='/history/#/mid=" + data[i].like_to_id + "&comId=" + data[i].like_to_com_id + "' target='_blank'>点击查看</a></p><p class='like-time'>" + data[i].like_time + "</p></div>"
			}
			if(msg_content == ""){
				msg_content = "<div class='list-empty'>你还没有收到过赞哟~</div>"
			}
			$(".message-sidebar .list .list-item").removeClass("active")
			$(".message-sidebar .list .list-item#" + type + "").addClass("active")
			$(".message-content .title").html("收到的赞")
			$(".message-content .list").html(msg_content)
			refreshHeader()
			return refleshRemind()
		}
		if(type == "comment"){
			var rows = result.data
			rows.sort(function (a, b) {
				return Date.parse(b.reply_time) - Date.parse(a.reply_time);//时间倒序
			});
			data = rows;
			for(var i = 0; i < data.length; i++){
				msg_content += "<div class='list-item comment' id='" + data[i].msg_id + "'><p class='reply-text'><span class='reply-user'>" + data[i].reply_user + "</span> 回复了你的评论，<a class='link-mid' href='/history/#/mid=" + data[i].reply_id + "&comId=" + data[i].reply_com_id + "' target='_blank'>点击查看</a></p><p class='reply-time'>" + data[i].reply_time + "</p></div>"
			}
			if(msg_content == ""){
				msg_content = "<div class='list-empty'>你还没有收到过回复哟~</div>"
			}
			$(".message-sidebar .list .list-item").removeClass("active")
			$(".message-sidebar .list .list-item#" + type + "").addClass("active")
			$(".message-content .title").html("回复我的")
			$(".message-content .list").html(msg_content)
			refreshHeader()
			return refleshRemind()
		}
	})
}