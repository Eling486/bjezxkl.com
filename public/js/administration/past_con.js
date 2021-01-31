//默认正序
var order_method = "positive"
var check_type_choosing = "waiting"

function loginFailed() {
	getContribution()
}

function loginSucceeded() {
	getContribution()
}

function getContribution() {
	$.get("/contribution/getall", function (data, err) {
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
		var conlist = ""
		//按时间排序
		var rows = data.data;
		//order_method = "positive"（正序）
		//"reverse"（倒序）
		if (order_method === "positive") {
			rows.sort(function (a, b) {
				return Date.parse(a.con_time) - Date.parse(b.con_time);//时间正序
			});
		} else if (order_method === "reverse") {
			rows.sort(function (a, b) {
				return Date.parse(b.con_time) - Date.parse(a.con_time);//时间倒序
			});
		}

		data = rows;

		var years = []
		for (var a = 0; a < data.length; a++) {
			var con_time = data[a].con_time.split('-')
			if ($.inArray(con_time[0], years) == -1) {
				years.push(con_time[0])
			}
		}
		for (var j = 0; j < years.length; j++) {
			var year = ""
			year = years[j];
			conlist += "<div class='list-year-wrap' id='" + year + "'><div class='list-year-text'><b>&nbsp;> " + year + "年</b></div>"
			for (var i = 0; i < data.length; i++) {
				var time = data[i].con_time.split(' ')[1]
				var date = data[i].con_time.split(' ')[0].split('-')
				if (date[0] == year) {
					if (!data[i].hope_showname) {
						var hope_showname_text = "<span class='con-infos-empty'>（未指定）</span>"
					} else {
						var hope_showname_text = data[i].hope_showname
					}
					if (data[i].state == "ok") {
						var state_text = "<span class='state-ok'>正常</span>"
					} else if (data[i].state == "vip") {
						var state_text = "<span class='state-vip'>会员</span>"
					} else {
						var state_text = "<span class='state-error'>无版权</span>"
					}
					conlist += "<div class='list-item list-item-" + data[i].cid +
						"'><div class='con-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(data[i]) +
						"</li><li class='obj mid'>" + data[i].cid +
						"</li><li class='obj key-obj date-obj date'>" + data[i].con_time +
						"</li><li class='obj ncmid'>" + data[i].ncmid +
						"</li><li class='obj state'>" + data[i].state +
						"</li><li class='obj key-obj hope-showname'>" + data[i].hope_showname +
						"</li><li class='obj key-obj realname'>" + data[i].realname +
						"</li><li class='obj key-obj artist'>" + data[i].artist +
						"</li><li class='obj con-uid'>" + data[i].con_uid +
						"</li><li class='obj con-user'>" + data[i].con_user +
						"</li></ul></div><div class='con-time'><div class='con-month'>" + date[1] +
						"</div><div class='con-line'></div><div class='con-day'>" + date[2] +
						"</div><div class='con-time-text'>" + time +
						"</div></div><div class='con-hope-showname'>" + hope_showname_text +
						"</div><div class='con-realname'>" + data[i].realname +
						"</div><div class='con-state'>" + state_text +
						"</div><div class='con-user'>投稿人：<span class='con-user-span'>" + data[i].con_user +
						"</span></div></div>"
				}
			}
		}
		if (data.length == 0) {
			conlist = "<div class='list-tips-wrap' id='empty'><div class='list-tips-text'>—— 暂无投稿 ——</div>"
		}
		conlist += "<div class='list-tips-wrap' id='error' style='display:none;'><div class='list-tips-text'><b>&nbsp;> 无搜索结果</b></div>"
		$(".list-content").html(conlist);
		$('.clear-span.search-month-clear').trigger("click");
		$('.clear-span.search-keyword-clear').trigger("click");
	})
}

$('.list-content').on('click', '.list-item', function () {
	var detailurl = ""
	var picurl
	var infos = JSON.parse($(this).children('.con-infos').children('.infos').children('.data').html());
	var state = infos.state
	var cid = infos.cid
	var id = infos.ncmid
	var realname = infos.realname
	var artist = infos.artist
	detailurl = "https://www.bjezxkl.com:5100/song/detail?ids=" + id
	$.getJSON({
		url: detailurl,
		timeout: 2000,
		error: function (data) {
			alert("获取歌曲封面出错！请重试.");
		},
		success: function (data) {
			picurl = data.songs["0"].al["picUrl"];
			var list = ap.list
			if (state == "ok") {
				ap.pause()
				ap.list.clear()
				ap.list.add([{
					name: realname,
					artist: artist,
					url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
					cover: picurl,
					customAudioType: {

					}
					/*theme: '#ebd0c2'*/
				}]);
				checkStart(cid)
			} else if (state == "vip" || state == "error") {
				var state_text = ""
				if (state == "vip") {
					state_text = "(会员曲目)"
				} else if (state == "error") {
					state_text = "(无版权)"
				}
				ap.pause()
				ap.list.clear()
				ap.list.add([{
					name: realname + state_text,
					artist: artist,
					url: "",
					cover: picurl,
					customAudioType: {

					}
					/*theme: '#ebd0c2'*/
				}]);
				checkStart(cid)
			}
		}
	});
});

function checkStart(cid) {
	$('.check-wrap').show()
	ap.list.hide()
	getConInfos(cid)
}
function getConInfos(cid) {
	var con_infos = JSON.parse($(".list-content .list-item.list-item-" + cid + " .con-infos .infos .data").html())
	if (!con_infos.hope_showname) {
		var hope_showname_text = "<span class='con-infos-empty'>（未指定）</span>"
	} else {
		var hope_showname_text = con_infos.hope_showname
	}
	if (!con_infos.hope_date) {
		var hope_date_text = "<span class='con-infos-empty'>（未指定）</span>"
	} else {
		var hope_date_text = con_infos.hope_date
	}
	if (!con_infos.plan_week) {
		var plan_week_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var plan_week_text = con_infos.plan_week
	}
	if (!con_infos.plan_date) {
		var plan_date_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var plan_date_text = con_infos.plan_date
	}
	if (!con_infos.showname) {
		var showname_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var showname_text = con_infos.showname
	}
	if (!con_infos.showname) {
		var showname_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var showname_text = con_infos.showname
	}
	if (con_infos.state == "ok") {
		var state_text = "<span class='state-ok'>正常</span>"
	} else if (con_infos.state == "vip") {
		var state_text = "<span class='state-vip'>会员</span>"
	} else {
		var state_text = "<span class='state-error'>无版权</span>"
	}
	if (con_infos.check_type == "waiting") {
		var type_text = "<span class='state-waiting' style='color: darkorange;'>待审核</span>"
	} else if (con_infos.check_type == "fail") {
		var type_text = "<span class='state-fail' style='color: red;'>未录用</span>"
	} else if (con_infos.check_type == "success") {
		var type_text = "<span class='state-success' style='color: green;'>已录用</span>"
	} else if (con_infos.check_type == "ready") {
		var type_text = "<span class='state-ready' style='color: green;'>已安排</span>"
	} else if (con_infos.check_type == "used") {
		var type_text = "<span class='state-used' style='color: grey;'>已使用</span>"
	}
	if (!con_infos.con_note) {
		var con_note_text = "<span class='con-infos-empty'>（无备注）</span>"
	} else {
		var con_note_text = con_infos.con_note
	}
	if (!con_infos.check_user) {
		var check_user_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var check_user_text = con_infos.check_user
	}
	if (!con_infos.check_note) {
		var check_note_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var check_note_text = con_infos.check_note
	}
	if (!con_infos.check_time) {
		var check_time_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var check_time_text = con_infos.check_time
	}
	var realname_text = con_infos.realname.replace(new RegExp("&nbsp;", ("gm")), " ");
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_infos))
	$('.coninfos-text span.coninfos#hope-date').html(hope_date_text)
	$('.coninfos-text span.coninfos#plan-week').html(plan_week_text)
	$('.coninfos-text span.coninfos#plan-date').html(plan_date_text)
	$('.coninfos-text span.coninfos#ncmid').html(con_infos.ncmid)
	$('.coninfos-text span.coninfos#state').html(state_text)
	$('.coninfos-text span.coninfos#realname').html(realname_text)
	$('.coninfos-text span.coninfos#hope-showname').html(hope_showname_text)
	$('.coninfos-text span.coninfos#showname').html(showname_text)
	$('.coninfos-text span.coninfos#artist').html(con_infos.artist)
	$('.coninfos-text span.coninfos#con-user').html(con_infos.con_user)
	$('.coninfos-text span.coninfos#con-time').html(con_infos.con_time)
	$('.coninfos-text span.coninfos#con-note').html(con_note_text)
	$('.coninfos-text span.coninfos#check-type').html(type_text)
	$('.coninfos-text span.coninfos#check-user').html(check_user_text)
	$('.coninfos-text span.coninfos#check-time').html(check_time_text)
	$('.coninfos-text span.coninfos#check-note').html(check_note_text)
}
//排序方式切换
$(document).on('click', '.order-method-wrap', function () {
	$('.clear-span.search-month-clear').trigger("click");
	$('.clear-span.search-keyword-clear').trigger("click");
	if ($(this).find('i').hasClass('fa-sort-numeric-desc')) {
		$(this).find('i').removeClass('fa-sort-numeric-desc')
		$(this).find('i').addClass('fa-sort-numeric-asc')
		$(this).find('.order-text-wrap').html('由旧到新')
		order_method = 'positive'
		getContribution()
	} else if ($(this).find('i').hasClass('fa-sort-numeric-asc')) {
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		$(this).find('.order-text-wrap').html('由新到旧')
		order_method = 'reverse'
		getContribution()
	}
})

$(document).on('click', '.show-search-btn', function () {
	if ($('.search-wrap').hasClass('showed')) {
		$('.search-wrap').removeClass('showed')
		$('.search-wrap .search-box').fadeOut()
		$('.search-wrap').animate({ height: "-=50px" }, 300)
		$('.search-wrap .text').html('展开搜索框')
	} else {
		$('.search-wrap').addClass('showed')
		$('.search-wrap .text').html('收起搜索框')
		$('.search-wrap').animate({ height: "+=50px" }, 300)
		$('.search-wrap .search-box').fadeIn()
	}
})
//按年、月份搜索
$("#search-month").focus(function () {
	year = ""
	month = ""
	$('.month-selector').slideDown()
	$("#search-month").parent().parent().addClass("choosing");

	$(".search-by-month-wrap").hover(function () {

	}, function () {
		$('.month-selector').slideUp()
		$("#search-month").blur()
		$("#search-month").parent().parent().removeClass("choosing");
		if ($("#search-month").val() == "-") {
			$("#search-month").val("")
			$("#search-month").change()
		}
		if ($('#search-month').val() == "") {
			$(this).parent().removeClass('input-filled')
		} else {
			$(this).parent().addClass('input-filled')
		}
	})
});

//空位补0
function PrefixInteger(num, length) {
	return (Array(length).join('0') + num).slice(-length);
}

//年份选择
$(document).on('click', '.month-selector .year-option-span', function () {
	if ($(this).is('.chosen')) {
		$(this).removeClass("chosen");
		year = ""
	} else {
		$(this).parent().children().removeClass("chosen");
		$(this).addClass("chosen");
		year = $(this).attr('id')
	}
	$("#search-month").val(year + '-' + month)
	$("#search-month").change()
})
//月份选择
$(document).on('click', '.month-selector .month-option-span', function () {
	if ($(this).is('.chosen')) {
		$(this).removeClass("chosen");
		month = ""
	} else {
		$(this).parent().children().removeClass("chosen");
		$(this).addClass("chosen");
		month = PrefixInteger($(this).attr('id'), 2) + "-"
	}
	$("#search-month").val(year + '-' + month)
	$("#search-month").change()
})

//年月选择框
$(".search-option").mouseleave(function () {
	$('.search-option').slideUp()
	$("#search-month").blur()
	$("#search-month").parent().parent().removeClass("choosing");
	if ($("#search-month").val() == "-") {
		$("#search-month").val("")
		$("#search-month").change()
	}
	if ($('#search-month').val() == "") {
		$(this).parent().removeClass('input-filled')
	} else {
		$(this).parent().addClass('input-filled')
	}
})

//清空选择
$('.clear-span.search-month-clear').click(function () {
	$(".month-selector span").removeClass("chosen");
});

$(document).on('click', '.type-span', function () {
	check_type_choosing = $(this).attr('id')
	$('.type-wrap .type-span').removeClass('choosing')
	$('.type-span#' + check_type_choosing).addClass('choosing')
})

$(document).on('click', '.open-in-ncm', function () {
	var url = "http://music.163.com/song?id=" + $('.coninfos#ncmid').html()
	window.open(url, '_blank');
})