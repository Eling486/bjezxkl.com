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
	$.get("/contribution/getneedcheck", function (data, err) {
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
			if(!data[i].hope_showname){
				var hope_showname_text = "<span class='con-infos-empty'>（未指定）</span>"
			}else{
				var hope_showname_text = data[i].hope_showname
			}
			if(data[i].state == "ok"){
				var state_text = "<span class='state-ok'>正常</span>"
			}else if(data[i].state == "vip"){
				var state_text = "<span class='state-vip'>会员</span>"
			}else{
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
		if (data.length == 0) {
			conlist = "<div class='list-tips-wrap' id='empty'><div class='list-tips-text'>—— 暂无待审核投稿 ——</div>"
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
			} else if(state == "vip" || state == "error"){
				var state_text = ""
				if(state == "vip"){
					state_text = "(会员曲目)"
				}else if(state == "error"){
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
function getConInfos(cid){
	var con_infos = JSON.parse($(".list-content .list-item.list-item-"+ cid + " .con-infos .infos .data").html())
	if(!con_infos.hope_showname){
		var hope_showname_text = "<span class='con-infos-empty'>（未指定）</span>"
	}else{
		var hope_showname_text = con_infos.hope_showname
	}
	if(!con_infos.hope_date){
		var hope_date_text = "<span class='con-infos-empty'>（未指定）</span>"
	}else{
		var hope_date_text = con_infos.hope_date
	}
	if(con_infos.state == "ok"){
		var state_text = "<span class='state-ok'>正常</span>"
	}else if(con_infos.state == "vip"){
		var state_text = "<span class='state-vip'>会员</span>"
	}else{
		var state_text = "<span class='state-error'>无版权</span>"
	}
	if(!con_infos.con_note){
		var con_note_text = "<span class='con-infos-empty'>（无备注）</span>"
	}else{
		var con_note_text = con_infos.con_note
	}
	var realname_text = con_infos.realname.replace(new RegExp("&nbsp;",("gm"))," ");
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_infos))
	$('.coninfos-text span.coninfos#hope-date').html(hope_date_text)
	$('.coninfos-text span.coninfos#ncmid').html(con_infos.ncmid)
	$('.coninfos-text span.coninfos#state').html(state_text)
	$('.coninfos-text input#realname').val(realname_text)
	$('.coninfos-text span.coninfos#hope-showname').html(hope_showname_text)
	$('.coninfos-text input#showname').val(con_infos.hope_showname)
	$('.coninfos-text input#artist').val(con_infos.artist)
	$('.coninfos-text span.coninfos#con-user').html(con_infos.con_user)
	$('.coninfos-text span.coninfos#con-time').html(con_infos.con_time)
	$('.coninfos-text span.coninfos#con-note').html(con_note_text)
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

$("input#plan-date").focus(function () {
	$('.plan-date-picker .date-selector').slideDown()
	$("input#plan-date").parent().parent().addClass("choosing");
	$(".plan-date-wrap").hover(function () {

	}, function () {
		$('.plan-date-picker .date-selector').slideUp()
		$("input#plan-date").blur()
		$("input#plan-date").parent().parent().removeClass("choosing");
		if ($('input#plan-date').val() == "") {
			$(this).parent().removeClass('input-filled')
		} else {
			$(this).parent().addClass('input-filled')
		}
	})
});

$('.clear-span.plan-date-clear').click(function () {
	var now = new Date()
	var now_year = now.getFullYear()
	var now_month = now.getMonth() + 1
	var param = JSON.parse($(this).siblings('.plan-date-picker').children('.date-selector.date.future').children('.param').html())
	var container = param.container
	var now_year_month = now_year + "-" + PrefixInteger(now_month, 2)
	$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(now_year_month)
	$(container).find('.year-and-month .btn#prev-year').removeClass('active')
	$(container).find('.year-and-month .btn#prev-month').removeClass('active')
	changeCalendarFuture(param, now_year, now_month, now)
});

$(document).on('click', '.btn-check-submit', function () {
	var check_type = check_type_choosing
	if (check_type_choosing == "waiting"){
		showPopup()
		$('.wrapper-popup .infos').html('请修改审核结果')
		$('.wrapper-popup .btn#cancel').hide()
		$('.wrapper-popup .btn#ok').attr("onclick", "hidePopup()");
	}
	if (check_type == "success") {
		showPopup()
		$('.wrapper-popup .infos').html('是否确定 <b style="color: #228B22;">录用</b> 该投稿')
		$('.wrapper-popup .btn#ok').attr("onclick", "checkAdopt()");
	} else if (check_type == 'fail') {
		showPopup()
		$('.wrapper-popup .infos').html('是否确定 <b style="color: #FF4500;">不录用</b> 该投稿')
		$('.wrapper-popup .btn#ok').attr("onclick", "checkFail()");
	}
})

$('body').on('click', '.wrapper-popup', function () {
	$('.wrapper-popup .content .close').trigger("click");
})
$('.wrapper-popup').on('click', '.content', function (e) {
	e.stopPropagation();
})

function checkAdopt() {
	var con_infos = JSON.parse($('.coninfos-text .coninfos#infos').html())
	var cid = con_infos.cid
	var plan_week = $('.coninfos-text input#plan-week').val()
	var plan_date = $('.coninfos-text input#plan-date').val()
	var showname = $('.coninfos-text input#showname').val()
	var realname = $('.coninfos-text input#realname').val()
	var artist = $('.coninfos-text input#artist').val()
	var check_type = check_type_choosing
	var check_note = $('.coninfos-text input#check-note').val()
	submitContributionCheck(cid, plan_week, plan_date, showname, realname, artist, check_type, check_note)
	hidePopup()
	getContribution()
}

function checkFail() {
	var con_infos = JSON.parse($('.coninfos-text .coninfos#infos').html())
	var cid = con_infos.cid
	var plan_week = $('.coninfos-text input#plan-week').val()
	var plan_date = $('.coninfos-text input#plan-date').val()
	var showname = $('.coninfos-text input#showname').val()
	var realname = $('.coninfos-text input#realname').val()
	var check_type = check_type_choosing
	var check_note = $('.coninfos-text input#check-note').val()
	submitContributionCheck(cid, plan_week, plan_date, showname, realname, "", check_type, check_note)
	hidePopup()
	getContribution()
}

function submitContributionCheck(cid, plan_week, plan_date, showname, realname, artist, check_type, check_note) {
	var data = {
		cid: cid,
		plan_week: plan_week,
		plan_date: plan_date,
		showname: showname,
		realname: realname,
		artist: artist,
		check_type: check_type,
		check_note: check_note
	}
	$.ajax({
		url: '/check/contribution',
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
				if (data.code == -504) {
					alert('这个投稿已经被人抢先审核了呢！')
					window.location.reload()
				}
				return console.log(data)
			}
			showPopup()
			$('.wrapper-popup .infos').html('审核成功')
			getContribution()
			$('.wrapper-popup .btn#cancel').hide()
			$('.wrapper-popup .btn#ok').attr("onclick", "checkReset()");
			$('.wrapper-popup').attr("onclick", "checkReset()");
		},
		error: function (data, err) {
			console.log(err);
		}
	})
}

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
        month = PrefixInteger($(this).attr('id'),2) + "-"
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

$(document).on('click', '.btn-check-cancel', function () {
	checkReset()
})

function checkReset(){
	window.location.reload();
}

$(document).on('click', '.open-in-ncm', function () {
    var url = "http://music.163.com/song?id=" + $('.coninfos#ncmid').html()
    window.open(url, '_blank');
})