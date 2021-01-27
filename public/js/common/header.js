$('.international-header').on('mouseenter', '.user-infos', function () {
    $('.nav-user-center .user-content .nav-user-item .user-tool-wrap').fadeIn('fast')
})
$('.international-header').on('mouseleave', '.user-infos', function () {
    $('.nav-user-center .user-content .nav-user-item .user-tool-wrap').fadeOut('fast')
})

$(function(){
	if($('.user-infos .username').html() == ""){
		$('.nav-user-item.nav-msg').hide()
	}else{
		$('.nav-user-item.nav-msg').show()
	}
})

$('.user-tool').off("click").on('click', '.link-logout', function () {
    $.get("/user/logout", function (data, err) {
        if (data.code !== 0) {
            return console.log(data)
        }
        alert('已登出')
        window.location.reload()
    })
})
function refreshHeader(){
    $(".international-header").load("/templates/header");
	getRemindNum()
}
function getRemindNum(){
	if($(".user-infos .username").html() !== ""){
		$.get("/user/remind", function (data, err) {
			if (data.code !== 0) {
				return
			}
			var remind_num = 0
			var new_like_num = data.data[0].new_like_num;
			var new_comment_num = data.data[0].new_comment_num;
			var unread_msg_num = data.data[0].unread_msg_num;
			var unread_system_num = data.data[0].unread_system_num;
			remind_num = new_like_num + new_comment_num + unread_msg_num + unread_system_num;
			if(remind_num == 0){
				$(".international-header .nav-user-center .nav-user-item .msg-remind").html("")
			}else if(remind_num > 99){
				$(".international-header .nav-user-center .nav-user-item .msg-remind").html("99+")
			}else{
				$(".international-header .nav-user-center .nav-user-item .msg-remind").html(remind_num)
			}
		})
	}
}
$('.international-header').off("click").on('click', '.link.administration', function () {
    $.get("/user/infos", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(data)
		}
		if(data.code == 0){
			if (data.data.type == "admin" || data.data.type == "super") {
				return window.location.href='/administration'
			}
		}
		return alert('您不是管理员，无法进行管理')
	})
})

/*$('.nav-user-item').on('click', '.link.link-msg', function () {
    $.get("/user/infos", function (data, err) {
		if (data.code !== 0) {
			if (data.code == -502) {
				alert('请先登录')
				return showQuickLogin()
			}
			return console.log(data)
		}
		//openInNewTab("about:blank")
		//var newWindow = window.open("about:blank");
		//newWindow.location='/message/#/';
		$(".nav-user-item .open-msg-page")[0].click();
	})
})*/