
function loginFailed() {
	pageLoaded()
}

function loginSucceeded() {
	pageLoaded()
}

function pageLoaded(){
	$.get("/user/infos", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return window.location.href='/'
			}
			return console.log(data)
		}
		var hash = window.location.hash.split("/")[1]
		getContent(hash)
	})
}

function hashChanged(){
	$.get("/user/infos", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(data)
		}
		$(".user-center-content .list").html("<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i>")
		var hash = window.location.hash.split("/")[1]
		getContent(hash)
	})
}

function getContent(type){
	if(!type){
		var type = "infos"
	}else{
		var type = type;
	}
	$(".user-center-sidebar .list .list-item").removeClass("active")
	$(".user-center-sidebar .list .list-item#" + type + "").addClass("active")
	if(type == "infos"){
		$.get("/user/infos", function (data, err) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				return console.log(data)
			}
			var username = data.data.username
			var uid = data.data.uid
			var email = data.data.email
			var reg_time = data.data.reg_time
			var type = data.data.type
			if(type == "normal"){
				var type_text = "<span class='type normal'>普通用户</span>"
			}else if(type == "admin"){
				var type_text = "<span class='type admin'>管理员</span>"
			}else if(type == "super"){
				var type_text = "<span class='type super'>超级管理员</span>"
			}else if(type == "banned"){
				var type_text = "<span class='type banned'>已被封禁</span>"
			}
			var user_infos_content = ""
			user_infos_content = "<div class='user-infos'><p>用户名：<span class='username'>" + username +
			"</span></p><p>uid：<span class='uid'>" + uid +
			"</span></p><p>邮箱：<span class='email'>" + email +
			"</span></p><p>注册时间：<span class='reg-time'>" + reg_time +
			"</span></p><p>账户类型：" + type_text +
			"</p></div>"
			return $(".user-center-content .list").html(user_infos_content)
		})
	}
	if(type == "contribution"){
		$.get("/contribution/getown", function (result, err) {
			if (result.code !== 0) {
				if (result.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				return console.log(result)
			}
			var rows = result.data
			rows.sort(function (a, b) {
				return Date.parse(b.cid) - Date.parse(a.cid);//时间倒序
			});
			data = rows;
			var con_content = ""
			for(var i = 0;i < data.length; i++){
				var cid = data[i].cid
				var revisable = data[i].revisable
				var hope_date = data[i].hope_date
				var ncmid = data[i].ncmid
				var hope_showname = data[i].hope_showname
				var realname = data[i].realname
				var artist = data[i].artist
				var con_time = data[i].con_time
				var check_type = data[i].check_type
				if(check_type == "waiting"){
					var check_type_text = "<span class='check-type-text' id='waiting'>待审核</span>"
				}else if(check_type == "success"){
					var check_type_text = "<span class='check-type-text' id='success'>已录用</span>"
				}else if(check_type == "ready"){
					var check_type_text = "<span class='check-type-text' id='ready'>已加入安排中</span>"
				}else if(check_type == "used"){
					var check_type_text = "<span class='check-type-text' id='used'>已确认播放时间/已播放</span>"
				}else if(check_type == "fail"){
					var check_type_text = "<span class='check-type-text' id='fail'>未录用</span>"
				}
				if(revisable == 1){
					var revisable_item = "<p class='revisable'>是否可修改：<span class='revisable true'>是</p>"
				}else if(revisable == 0){
					var revisable_item = "<p class='revisable'>是否可修改：<span class='revisable false'>否</p>"
				}
				if(hope_date == null || hope_date == ""){
					var hope_date_text = "<span class='infos-empty'>（未指定）</span>"
				}else{
					var hope_date_text = hope_date
				}
				if(hope_showname == null || hope_showname == ""){
					var hope_showname_text = "<span class='infos-empty'>（未指定）</span>"
				}else{
					var hope_showname_text = hope_showname
				}
				con_content += "<div class='list-item contribution' id='" + cid + 
				"'><div class='con-title'>投稿：《" + realname + 
				"》</div><div class='con-content'><p class='cid'>投稿id：" + cid + 
				"</p>" + revisable_item + 
				"<p class='hope-date'>希望播放日期：" + hope_date_text +
				"</p><p class='ncmid'>网易云id：" + ncmid +
				"</p><p class='realname'>实际名称：" + realname + 
				"</p><p class='artist'>音乐人：" + artist +
				"</p><p class='hope-showname'>希望显示名称：" + hope_showname_text +
				"</p><p class='con-time'>投稿时间：" + con_time +
				"</p><p class='check-type'>审核状态：" + check_type_text +
				"</p></div></div>"
			}
			return $(".user-center-content .list").html(con_content)
		})
	}
	if(type == "revise"){
		return $(".user-center-content .list").html("<div class='not-open'><p>该功能暂未开放哟~</p><p>如有必要需求，请发邮件至evanchen486@163.com</p></div>")
	}
	if(type == "password"){
		return $(".user-center-content .list").html("<div class='not-open'><p>该功能暂未开放哟~</p><p>如有必要需求，请发邮件至evanchen486@163.com</p></div>")
	}
}