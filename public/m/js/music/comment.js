function getCommentsByMid(mid) {
    $.get("/comment/getbyid?type=music&id=" + mid, function (data, err) {
        if (data.code !== 0) {
            return console.log(data)
        }
        if (data.uid) {
            var uid = data.uid
        }
        data = data.data

        var commentList = ""
        for (var i = 0; i < data.length; i++) {
            if (data[i].is_reply === 1) {
                var newItem = addCommentItemHasReply(data[i], uid)
                commentList += newItem
            } else {
                var newItem = addCommentItemCommon(data[i], uid)
                commentList += newItem
            }
        }
        if (commentList == "") {
            commentList += "<div class='comment-tips' id='empty'><span>还没有人评论呦~快来评论吧</span></div>"
        }
        $(".comment-list-content").html(commentList);
		
		var hash = window.location.hash
		if(hash){
			window.location.hash = "/"
			hash = hash.split("/")[1]
			if(hash !== ""){
				$(".aplayer-info").trigger("click");
				setTimeout(function(){
					$(".tool-item.show-comment-page").trigger("click");
					setTimeout(function(){
						var mid = hash.split("&")[0].split("=")[1]
						var com_id = hash.split("&")[1].split("=")[1]
						$('.comment-wrap').animate({
							scrollTop: $("#com-" + com_id + "").offset().top - $('.comment-wrap').offset().top + $('.comment-wrap').scrollTop() - 60
						},500,function(){
							$(".comment-list .comment-item#com-" + com_id + "").addClass("twinkle")
							ap.pause()
							setTimeout(function(){
								$(".comment-list .comment-item#com-" + com_id + "").removeClass("twinkle")
							}, 500);
						});
					},500)
				},500)
			}
		}
        cancelReply()
    })
}
function addCommentItemHasReply(data, uid) {
    var newItem = ""
    newItem += "<div class='comment-item reply' id='com-" + data.com_id + "'><div class='com-infos' style='display: none;'>" + JSON.stringify(data) +
        "</div><div class='com-user'>" + data.user +
        "</div><div class='com-time'>" + data.com_send_time +
        "</div><div class='reply-wrap'><div class='reply-infos'>回复 <span class='reply-user'>" + data.reply_to_user +
        "</span> :</div><div class='reply-content'><p>" + data.reply_to_content +
        "</p></div></div><div class='com-content'><p>" + data.com_content +
        "</p></div><div class='comment-operation'>"
    if (uid) {
        var likeUsers = data.com_like_user.split(',')
        if (likeUsers.indexOf(uid.toString()) >= 0) {
            newItem += "<div class='com-like liked'><i class='fa fa-thumbs-up liked' aria-hidden='true'></i>"
        } else {
            newItem += "<div class='com-like'><i class='fa fa-thumbs-o-up' aria-hidden='true'></i>"
        }
    } else {
        newItem += "<div class='com-like'><i class='fa fa-thumbs-o-up' aria-hidden='true'></i>"
    }
    newItem += "<span class='like-num'>" + data.com_like_num +
        "</span></div><div class='com-reply'><i class='fa fa-comment-o' aria-hidden='true'></i></div></div></div>"
    return newItem;
}
function addCommentItemCommon(data, uid) {

    var newItem = ""
    newItem += "<div class='comment-item' id='com-" + data.com_id + "'><div class='com-infos' style='display: none;'>" + JSON.stringify(data) +
        "</div><div class='com-user'>" + data.user +
        "</div><div class='com-time'>" + data.com_send_time +
        "</div><div class='com-content'><p>" + data.com_content +
        "</p></div><div class='comment-operation'>"
    if (uid) {
        var likeUsers = data.com_like_user.split(',')
        if (likeUsers.indexOf(uid.toString()) >= 0) {
            newItem += "<div class='com-like liked'><i class='fa fa-thumbs-up liked' aria-hidden='true'></i>"
        } else {
            newItem += "<div class='com-like'><i class='fa fa-thumbs-o-up' aria-hidden='true'></i>"
        }
    } else {
        newItem += "<div class='com-like'><i class='fa fa-thumbs-o-up' aria-hidden='true'></i>"
    }
    newItem += "<span class='like-num'>" + data.com_like_num +
        "</span></div><div class='com-reply'><i class='fa fa-comment-o' aria-hidden='true'></i></div></div></div>"
    return newItem;
}
//回复
$('.comment-list-content').on('click', '.com-reply', function () {
    var com_infos = JSON.parse($(this).parent().siblings('.com-infos').html())
    addReply(com_infos)
})
//取消回复
$(".comment-textarea").blur(function(){
	setTimeout(function(){
		cancelReply();
	},200)
});

$('.comment-list-content').on('click', '.com-like', function () {
    var com_infos = JSON.parse($(this).parent().siblings('.com-infos').html())
    Like(com_infos.com_id, com_infos.com_on_id)
})

function Like(comId, mid) {
    $.ajax({
        url: '/comment/like?comId=' + comId,
        type: 'post',
        success: function (data, status) {
            if (data.code !== 0) {
                if (data.code == -502) {
                    alert('请先登录')
                    showQuickLogin()
                }
                return console.log(data)
            }
            getCommentsByMid(mid)
        },
        error: function (data, err) {
            console.log(err);
        }
    })
}

function addReply(infos) {
    var replyTips = ""
    replyTips += "<span class='reply-to-comment-infos' style='display: none;'>" + JSON.stringify(infos) +
        "</span>"
    $(".com-reply-wrap").html(replyTips);
    $('.comment-textarea').attr("placeholder", "回复 " + infos.user + " …");
    $('.comment-textarea').focus()
}
function cancelReply() {
    $(".com-reply-wrap").html("");
    $('.comment-textarea').attr("placeholder", "可以在这里评论呦~");
}

$('.send-button-wrap').on('click', '.send-btn', function () {
    var com_content = $('.comment-textarea').val()
    var music_infos = JSON.parse($('.music-infos-wrap .musicinfos-text .musicinfos#infos').html())
    if ($(this).parent().siblings('.com-reply-wrap').html() == "") {
        var is_reply = 0
    } else {
        var is_reply = 1
        var reply_infos = JSON.parse($(this).parent().siblings('.com-reply-wrap').children('.reply-to-comment-infos').html())
    }

    if (com_content !== "") {
        submitComment(music_infos, com_content, is_reply, reply_infos)
    } else {
        alert('请输入评论')
    }
})

function submitComment(music_infos, com_content, is_reply, reply_infos) {
    if (is_reply === 0) {
        var data = {
            type: "music",
            id: music_infos.mid,
            is_reply: 0,
            content: com_content,
        }

    } else if (is_reply === 1) {
        var data = {
            type: "music",
            id: music_infos.mid,
            is_reply: 1,
            content: com_content,
            reply_to_com_id: reply_infos.com_id,
            reply_to_uid: reply_infos.uid,
            reply_to_user: reply_infos.user,
            reply_to_content: reply_infos.com_content
        }
    }
    $.ajax({
        url: '/comment/send',
        type: 'post',
        data: data,
        success: function (data, status) {
            if (data.code !== 0) {
                if (data.code == -502) {
                    alert('请先登录')
                    showQuickLogin()
                }
                return console.log(data)
            }
            alert('评论成功（审核通过后即可查看）')
            $('.comment-textarea').val('')
            cancelReply()
            getCommentsByMid(music_infos.mid)
        },
        error: function (data, err) {
            console.log(err);
        }
    })
}