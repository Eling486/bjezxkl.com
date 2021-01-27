$('.con-box .ncmurl-wrap .clear-span').click(function () {
	$('.con-box .message#ncmurl').html('');
	ap.pause();
	$('.infos-wrap').hide();
	clearInputs()
	$('.con-reqs').show();
})

function loginSucceeded() {
	getConNum()
	getInLineNum()
}

function getConNum(){
	$.getJSON({
		url: "/contribution/getconnum",
		timeout: 2000,
		error: function (data) {
			
		},
		success: function (data) {
			if(data.code !== 0){
				if (data.code == -502) {
					con_num_text = "<a href='javascript:;' onclick='showQuickLogin()'>登录</a>后可以查看自己的<b>剩余投稿额度</b>哟~"
					return $(".req-text.con-num").html(con_num_text)
                }
				return console.log(data)
			}
			var con_num = data.con_num
			var con_num_rest = 4 - con_num
			var con_num_text = ""
			if(con_num_rest == 0){
				con_num_text = "<b>剩余投稿额度：</b>你本月的投稿额度用完了哦，下个月再来吧~"
			}else if(con_num_rest > 0){
				con_num_text = "<b>剩余投稿额度：</b>你本月还能再投 " + con_num_rest + " 个稿件哦~"
			}else if(con_num_rest < 0){
				con_num_text = "<b>剩余投稿额度：</b>你本月已经投了 " + con_num + " 个稿件嘞！"
			}
			return $(".req-text.con-num").html(con_num_text)
		}
	})
}

function getInLineNum(){
	$.getJSON({
		url: "/contribution/inline",
		timeout: 2000,
		error: function (data) {
			
		},
		success: function (data) {
			if(data.code !== 0){
				return console.log(data)
			}
			var data = data.data
			var waiting_num = data[0].waiting_num
			var success_num = data[0].success_num
			var inline_num = data[0].inline_num
			var inline_text = ""
			if(waiting_num == 0){
				inline_text = "<b>审核队列：</b>当前没有等待审核的稿件呢~"
			}else{
				inline_text = "<b>审核队列：</b>当前还有 " + waiting_num + " 个稿件正在等待审核，请耐心等待哟~"
			}
			return $(".req-text.inline-num").html(inline_text)
		}
	})
}

function getNCMMusic() {
	var ncmurl = $('.con-box input#ncmurl').val()
	var format = new RegExp("music.163.com");
	if (ncmurl == "") {
		return $('.con-box .message#ncmurl').html('请粘贴网易云音乐链接')
	} else if (format.test(ncmurl)) {
		if (ncmurl.indexOf("?id=") >= 0) {
			//e.g.http://music.163.com/song?id=480355041&userid=333267690
			//    https://y.music.163.com/m/song?id=1461643559&userid=259800353
			ncmid = ncmurl.split("?id=")[1]
			ncmid = ncmid.split("&")[0]
		} else if (ncmurl.indexOf("/song/") >= 0) {
			//e.g.http://music.163.com/song/1362857147/?userid=259800353
			ncmid = ncmurl.split("/song/")[1]
			ncmid = ncmid.split("/")[0]
		} else {
			$('#error-wrap').html('<div style="color:red;">链接格式可能有误 推荐直接从电脑端获取链接后重试</div>');
		};
		detailurl = "https://www.bjezxkl.com:5100/song/detail?ids=" + ncmid
		musicurl = "https://www.bjezxkl.com:5100/song/url?id=" + ncmid
		checkurl = "https://www.bjezxkl.com:5100/check/music?id=" + ncmid

		$.getJSON({
			url: detailurl,
			timeout: 2000,
			error: function (data) {
				alert("获取歌曲信息出错！请重试.");
			},
			success: function (data) {
				if (data.songs.length == 0) {
					return $('.con-box .message#ncmurl').html("该歌曲不存在")
				}
				var musicinfo = ""
				$('.con-box .message#ncmurl').html("<span style='color: green'>链接识别成功</span>")
				realname = data.songs["0"].name;
				picurl = data.songs["0"].al["picUrl"];
				artist = "";
				for (var i = 0; i < data.songs["0"].ar.length; i++) {
					artist += data.songs["0"].ar[i].name + "/"
				}
				artist = artist.substr(0, artist.length - 1);

				$.getJSON({
					url: musicurl,
					timeout: 2000,
					error: function (data) {
						alert("获取歌曲状态信息出错！请重试.");
					},
					success: function (data) {
						if (data.data["0"].url !== "" && data.data["0"].url !== null) {
							state = "ok"
							$('.con-infos .con-infos-row#ncmid .infos-text').html(ncmid);
							$('.con-infos .con-infos-row#realname .infos-text').html(realname);
							$('.con-infos .con-infos-row#artist .infos-text').html(artist);
							$('.con-infos .con-infos-row#state .infos-text').html(state);
							$('.con-reqs').hide();
							clearInputs()
							$('.infos-wrap').show();
							ap.list.hide()
							ap.list.clear()
							ap.list.add([{
								name: realname,
								artist: artist,
								url: "https://music.163.com/song/media/outer/url?id=" + ncmid + ".mp3",
								cover: picurl,
							}]);
							ap.list.hide()
						} else {
							$.getJSON({
								url: checkurl,
								timeout: 2000,
								error: function (check_data) {
									$.getJSON({
										url: checkurl,
										timeout: 2000,
										error: function (check_data) {
											if (check_data.responseJSON.success == false) {
												state = "error"
												$('.con-infos .con-infos-row#ncmid .infos-text').html(ncmid);
												$('.con-infos .con-infos-row#realname .infos-text').html(realname);
												$('.con-infos .con-infos-row#artist .infos-text').html(artist);
												$('.con-infos .con-infos-row#state .infos-text').html(state);
												$('.con-reqs').hide();
												clearInputs()
												$('.infos-wrap').show();
												ap.list.hide()
												ap.list.clear()
												ap.list.add([{
													name: realname + "(该曲目因版权原因无法播放)",
													artist: artist,
													//url: "",
													cover: picurl,
												}]);
												ap.list.hide()
											} else {
												alert("获取歌曲状态信息(check-json)出错！请重试.");
											}
										},
										success: function (check_data) {
											if (check_data.success == true) {
												state = "vip"
												$('.con-infos .con-infos-row#ncmid .infos-text').html(ncmid);
												$('.con-infos .con-infos-row#realname .infos-text').html(realname);
												$('.con-infos .con-infos-row#artist .infos-text').html(artist);
												$('.con-infos .con-infos-row#state .infos-text').html(state);
												$('.con-reqs').hide();
												clearInputs()
												$('.infos-wrap').show();
												ap.list.hide()
												ap.list.clear()
												ap.list.add([{
													name: realname + "(该曲目为会员歌曲，无法播放)",
													artist: artist,
													//url: "",
													cover: picurl,
												}]);
												ap.list.hide()
											}
										}
									})
								},
								success: function (check_data) {
									if (check_data.success == true) {
										state = "vip"
										$('.con-infos .con-infos-row#ncmid .infos-text').html(ncmid);
										$('.con-infos .con-infos-row#realname .infos-text').html(realname);
										$('.con-infos .con-infos-row#artist .infos-text').html(artist);
										$('.con-infos .con-infos-row#state .infos-text').html(state);
										$('.con-reqs').hide();
										clearInputs()
										$('.infos-wrap').show();
										ap.list.hide()
										ap.list.clear()
										ap.list.add([{
											name: realname + "(该曲目为VIP歌曲，无法播放)",
											artist: artist,
											//url: "",
											cover: picurl,
										}]);
										ap.list.hide()
									}
								}
							})
						}
					}
				});
			}
		})
	} else {
		return $('.con-box .message#ncmurl').html('链接格式有误 请使用下方教程方法获取链接')
	}
}

function clearInputs(){
	$(".clear-span.hope-showname-clear").trigger("click");
	$(".clear-span.hope-date-clear").trigger("click");
	$(".clear-span.con-note-clear").trigger("click");
}
$("input#hope-date").focus(function () {
	$('.hope-date-picker .date-selector').slideDown()
	$("input#hope-date").parent().parent().addClass("choosing");
	$(".hope-date-wrap").hover(function () {

	}, function () {
		$('.hope-date-picker .date-selector').slideUp()
		$("input#hope-date").blur()
		$("input#hope-date").parent().parent().removeClass("choosing");
		if ($('input#hope-date').val() == "") {
			$(this).parent().removeClass('input-filled')
		} else {
			$(this).parent().addClass('input-filled')
		}
	})
});

$('.clear-span.hope-date-clear').click(function () {
	var now = new Date()
	var now_year = now.getFullYear()
	var now_month = now.getMonth() + 1
	var param = JSON.parse($(this).siblings('.hope-date-picker').children('.date-selector.date.future').children('.param').html())
	var container = param.container
	var now_year_month = now_year + "-" + PrefixInteger(now_month, 2)
	$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(now_year_month)
	$(container).find('.year-and-month .btn#prev-year').removeClass('active')
	$(container).find('.year-and-month .btn#prev-month').removeClass('active')
	changeCalendarFuture(param, now_year, now_month, now)
});

$('.btn.btn-submit#con-submit').click(function () {
	var hope_date = $(".hope-date-wrap input#hope-date").val()
	var ncmid = $(".con-infos-row#ncmid .infos-text").html()
	var state = $(".con-infos-row#state .infos-text").html()
	var hope_showname = $(".hope-showname-wrap input#hope-showname").val()
	var realname = $(".con-infos-row#realname .infos-text").html()
	var artist = $(".con-infos-row#artist .infos-text").html()
	var con_note = $(".con-note-wrap input#con-note").val()
	var data = {
		hope_date: hope_date,
		ncmid: ncmid,
		state: state,
		hope_showname: hope_showname,
		realname: realname,
		artist: artist,
		con_note: con_note
	}
	$.ajax({
        url: '/contribution/contribute',
        type: 'post',
        data: data,
        success: function (data, status) {
            if (data.code !== 0) {
                if (data.code == -502) {
                    alert('请先登录')
                    return showQuickLogin()
                }
				if (data.code == -504) {
                    $('.con-box .message#ncmurl').html("<span style='color: red'>1个月内已投过该稿件</span>")
                    return alert(data.message + "\n你在" + data.data.con_time + "时就已经投过这个稿了呦~\n换一个再投吧！")
                }
				if (data.code == -505) {
					$('.con-box .message#ncmurl').html("<span style='color: red'>到达本月投稿上限</span>")
                    return alert("你这个月都投了8个稿件了\n已经到达上限惹")
                }
				if (data.code == -510) {
					$('.con-box .message#ncmurl').html("<span style='color: red'>您已被封禁</span>")
                    return alert("您因某些原因已被封禁辽\n如有疑问请前往关于页联系管理员申诉")
                }
                return console.log(data)
            }
            alert('投稿成功，请关注站内消息来获知审核结果呦~')
			$(".con-box .ncmurl-wrap .clear-span").trigger("click");
			clearInputs()
			getInLineNum()
			getConNum()
        },
        error: function (data, err) {
            console.log(err);
        }
    })
})