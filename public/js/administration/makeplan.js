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
	$.get("/contribution/getsuccess", function (data, err) {
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
					if (!data[i].showname) {
						var plan_showname_text = "<span class='con-infos-empty'>（待定）</span>"
					} else {
						var plan_showname_text = data[i].showname
					}
					if (data[i].state == "ok") {
						var state_text = "<span class='state-ok'>正常</span>"
					} else if (data[i].state == "vip") {
						var state_text = "<span class='state-vip'>会员</span>"
					} else {
						var state_text = "<span class='state-error'>无版权</span>"
					}
					if (data[i].check_type == "success") {
						var type_text = "<span class='type-success'>待安排</span>"
					} else if (data[i].check_type == "ready") {
						var type_text = "<span class='type-ready'><b>安排中</b></span>"
					}
					conlist += "<div class='list-item list-item-" + data[i].cid +
						"'><div class='con-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(data[i]) +
						"</li><li class='obj mid'>" + data[i].cid +
						"</li><li class='obj key-obj date-obj date'>" + data[i].con_time +
						"</li><li class='obj ncmid'>" + data[i].ncmid +
						"</li><li class='obj state'>" + data[i].state +
						"</li><li class='obj key-obj plan-showname'>" + data[i].showname +
						"</li><li class='obj key-obj realname'>" + data[i].realname +
						"</li><li class='obj key-obj artist'>" + data[i].artist +
						"</li><li class='obj con-uid'>" + data[i].con_uid +
						"</li><li class='obj con-user'>" + data[i].con_user +
						"</li></ul></div><div class='con-time'><div class='con-month'>" + date[1] +
						"</div><div class='con-line'></div><div class='con-day'>" + date[2] +
						"</div><div class='con-time-text'>" + time +
						"</div></div><div class='con-plan-showname'>" + plan_showname_text +
						"</div><div class='con-realname'>" + data[i].realname +
						"</div><div class='con-state'>" + state_text +
						"</div><div class='con-type'>" + type_text +
						"</div><div class='con-user'>cid：<span class='con-user-span'>" + data[i].cid +
						"</span></div></div>"
				}
			}
		}
		if (data.length == 0) {
			conlist = "<div class='list-tips-wrap' id='empty'><div class='list-tips-text'>—— 暂无待安排投稿 ——</div>"
		}
		conlist += "<div class='list-tips-wrap' id='error' style='display:none;'><div class='list-tips-text'><b>&nbsp;> 无搜索结果</b></div>"
		$(".list-content").html(conlist);
		$('.clear-span.search-month-clear').trigger("click");
		$('.clear-span.search-keyword-clear').trigger("click");
		getPlanConfirm(1)
		$('.plan-wrap').show()
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
		var plan_week_text = "<span class='con-infos-empty'>（未指定）</span>"
	} else {
		var plan_week_text = con_infos.plan_week
	}
	if (!con_infos.plan_date) {
		var plan_date_text = "<span class='con-infos-empty'>（未指定）</span>"
	} else {
		var plan_date_text = con_infos.plan_date
	}
	if (!con_infos.showname) {
		var showname_text = "<span class='con-infos-empty'>（未指定）</span>"
	} else {
		var showname_text = con_infos.showname
	}
	if (!con_infos.artist) {
		var artist_text = "<span class='con-infos-empty'>（无）</span>"
	} else {
		var artist_text = con_infos.artist
	}
	if (con_infos.state == "ok") {
		var state_text = "<span class='state-ok'>正常</span>"
	} else if (con_infos.state == "vip") {
		var state_text = "<span class='state-vip'>会员</span>"
	} else {
		var state_text = "<span class='state-error'>无版权</span>"
	}
	if (!con_infos.con_note) {
		var con_note_text = "<span class='con-infos-empty'>（无备注）</span>"
	} else {
		var con_note_text = con_infos.con_note
	}
	var realname_text = con_infos.realname.replace(new RegExp("&nbsp;", ("gm")), " ");
	conInfosClear()
	$('.coninfos-text span.coninfos#infos').html(JSON.stringify(con_infos))
	$('.coninfos-text span.coninfos#hope-date').html(hope_date_text)
	$('.coninfos-text span.coninfos#plan-week').html(plan_week_text)
	$('.coninfos-text span.coninfos#plan-date').html(plan_date_text)
	$('.coninfos-text span.coninfos#hope-showname').html(hope_showname_text)
	$('.coninfos-text span.coninfos#realname').html(realname_text)
	$('.coninfos-text span.coninfos#showname').html(showname_text)
	$('.coninfos-text span.coninfos#artist').html(artist_text)
	$('.coninfos-text span.coninfos#ncmid').html(con_infos.ncmid)
	$('.coninfos-text span.coninfos#state').html(state_text)
	$('.coninfos-text span.coninfos#con-user').html(con_infos.con_user)
	$('.coninfos-text span.coninfos#con-time').html(con_infos.con_time)
	$('.coninfos-text span.coninfos#con-note').html(con_note_text)
	$('.coninfos-text span.coninfos#check-note').html(con_infos.check_note)

	$('.planinfos-text input#realname').val(realname_text)
	$('.planinfos-text input#showname').val(con_infos.showname)
	if (con_infos.check_type == "ready") {
		$('.planinfos-text input#week').val(con_infos.plan_week)
		$('.planinfos-text input#date').val(con_infos.plan_date)
	}
}

function conInfosClear() {
	$('.coninfos-text span.coninfos').html("")
	$(".planinfos-text input[type='text']").val("")
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

$("input#date").focus(function () {
	$('.date-picker .date-selector').slideDown()
	$("input#date").parent().parent().addClass("choosing");
	$(".date-wrap").hover(function () {

	}, function () {
		$('.date-picker .date-selector').slideUp()
		$("input#date").blur()
		$("input#date").parent().parent().removeClass("choosing");
		if ($('input#date').val() == "") {
			$(this).parent().removeClass('input-filled')
		} else {
			$(this).parent().addClass('input-filled')
		}
	})
});

$('.clear-span.date-clear').click(function () {
	var now = new Date()
	var now_year = now.getFullYear()
	var now_month = now.getMonth() + 1
	var param = JSON.parse($(this).siblings('.date-picker').children('.date-selector.date.future').children('.param').html())
	var container = param.container
	var now_year_month = now_year + "-" + PrefixInteger(now_month, 2)
	$(container).find('.date-selector.date.future .year-and-month .text#year-month').html(now_year_month)
	$(container).find('.year-and-month .btn#prev-year').removeClass('active')
	$(container).find('.year-and-month .btn#prev-month').removeClass('active')
	changeCalendarFuture(param, now_year, now_month, now)
});

$('body').on('click', '.btn-plan-submit', function () {
	showPopup()
	$('.wrapper-popup .infos').html('是否确定提交预备安排')
	$('.wrapper-popup .btn#ok').attr("onclick", "planSubmit()");
})

$('body').on('click', '.wrapper-popup', function () {
	$('.wrapper-popup .content .close').trigger("click");
})
$('.wrapper-popup').on('click', '.content', function (e) {
	e.stopPropagation();
})

function planSubmit() {
	var con_infos = JSON.parse($('.coninfos-text .coninfos#infos').html())
	var cid = con_infos.cid
	var type = con_infos.check_type
	var week = $('.planinfos-text input#week').val()
	var date = $('.planinfos-text input#date').val()
	var showname = $('.planinfos-text input#showname').val()
	var realname = $('.planinfos-text input#realname').val()
	if (!week) {
		if (type == "ready") {
			var re = confirm("注意！该操作将会将投稿状态从 安排中 降为 已录用");
			if (re == true) {
				week = ""
				date = ""
			} else {
				return
			}
		} else {
			return alert('请填写播放周')
		}
	}
	if (!date) {
		if (type == "ready") {
			var re = confirm("注意！该操作将会将投稿状态从 安排中 降为 已录用");
			if (re == true) {
				week = ""
				date = ""
			} else {
				return
			}
		} else {
			return alert('请填写播放日期')
		}
	}
	if (!showname) {
		return alert('请填写显示名称')
	}
	if (!realname) {
		return alert('请填写真实名称')
	}
	submitPreparatoryPlan(cid, week, date, showname, realname)
	hidePopup()
	getContribution()
}

function submitPreparatoryPlan(cid, plan_week, plan_date, showname, realname) {
	var data = {
		cid: cid,
		plan_week: plan_week,
		plan_date: plan_date,
		showname: showname,
		realname: realname
	}
	$.ajax({
		url: '/admin/makeplan',
		type: 'post',
		data: data,
		success: function (data, status) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return window.location.reload()
				}
				if (data.code == -510) {
					alert('您不是管理员')
					return window.location.href = "/";
				}
				if (data.code == -503) {
					return alert(data.message)
				}
				return console.log(data)
			}
			showPopup()
			$('.wrapper-popup .infos').html(data.message)
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
		$('.search-wrap').animate({ height: "36px" }, 300)
		$('.search-wrap .text').html('展开搜索框')
	} else {
		$('.search-wrap').addClass('showed')
		$('.search-wrap .text').html('收起搜索框')
		$('.search-wrap').animate({ height: "+=80px" }, 300)
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

$(document).on('click', '.btn-plan-cancel', function () {
	checkReset()
})

function checkReset() {
	window.location.reload();
}

$(document).on('click', '.open-in-ncm', function () {
	var url = "http://music.163.com/song?id=" + $('.coninfos#ncmid').html()
	//var url = "orpheus://song/" + $('.coninfos#ncmid').html()
	window.open(url, '_blank');
})

//plan查看部分

Date.prototype.Format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"H+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

$(".plan-info").on('click', '.btn#prev-week', function () {
	var week = parseInt($(".plan-info .class-text").attr("week"))
	week = week - 1
	$(".plan-info .class-text").attr("week", week)
	//console.log(week)
	getPlanConfirm(week)
})
$(".plan-info").on('click', '.btn#next-week', function () {
	var week = parseInt($(".plan-info .class-text").attr("week"))
	week = week + 1
	$(".plan-info .class-text").attr("week", week)
	//console.log(week)
	getPlanConfirm(week)
})

var submit_days_fin = []

function getPlanConfirm(week) {
	$(".plan-content").html("<div class='list-loading'><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>")
	//week = 1 ->下周
	var now = new Date();
	var nowTime = now.getTime();
	var day = now.getDay();
	var oneDayTime = 24 * 60 * 60 * 1000;
	var Nowtime = new Date()
	var week_num = week
	//获得周一到周日时间
	if (day === 0) {
		day = 7
	}
	var MonTime = nowTime - (day - 1 - week_num * 7) * oneDayTime;
	var TueTime = nowTime - (day - 2 - week_num * 7) * oneDayTime;
	var WedTime = nowTime - (day - 3 - week_num * 7) * oneDayTime;
	var ThuTime = nowTime - (day - 4 - week_num * 7) * oneDayTime;
	var FriTime = nowTime - (day - 5 - week_num * 7) * oneDayTime;
	var SatTime = nowTime - (day - 6 - week_num * 7) * oneDayTime;
	var SunTime = nowTime - (day - 7 - week_num * 7) * oneDayTime;

	//格式转换
	var day_1 = new Date(MonTime).Format("yyyy-MM-dd");
	var day_2 = new Date(TueTime).Format("yyyy-MM-dd");
	var day_3 = new Date(WedTime).Format("yyyy-MM-dd");
	var day_4 = new Date(ThuTime).Format("yyyy-MM-dd");
	var day_5 = new Date(FriTime).Format("yyyy-MM-dd");
	var day_6 = new Date(SatTime).Format("yyyy-MM-dd");
	var day_7 = new Date(SunTime).Format("yyyy-MM-dd");
	$(".plan-info#week .day-start").html(day_1)
	$(".plan-info#week .day-end").html(day_7)
	var data = {
		monday: day_1,
		sunday: day_7
	}
	$.ajax({
		url: '/contribution/getready',
		type: 'post',
		data: data,
		success: function (result, status) {
			if (result.code !== 0) {
				if (result.code == -502) {
					alert('请先登录')
					window.location.reload()
				}
				if (result.code == -510) {
					alert('您不是管理员')
					window.location.href = "/";
				}
				return console.log(result)
			}
			var data = result.data
			var days = [day_1, day_2, day_3, day_4, day_5, day_6, day_7]
			var weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
			var plan_content = ""
			//console.log(data)
			if (data.length == 0) {
				plan_content = "<div class='plan' id='none'><span class='plan-empty'>——这周一个安排也没有呢——</span></div>"
				return $('.plan-content').html(plan_content);
			}
			//var plans = []
			var submit_days = []
			var noplan_day = []
			var planed_day = []
			var re_plan = []
			var error_day = []
			var confirmed_day = []
			//for (var j = 0; j < 7; j++){
			var j = 0
			run(j)

			function run(j) {
				var weekday = weekdays[j]
				var date = days[j]
				var date_item = date.split("-")
				var planed = false
				var indb = false
				var date_data = { date: date }
				$.ajax({
					url: '/admin/hasplan',
					type: 'post',
					data: date_data,
					success: function (result, status) {
						if (result.code !== 0) {
							if (result.code == -502) {
								alert('请先登录')
								window.location.reload()
							}
							if (result.code == -510) {
								alert('您不是管理员')
								window.location.href = "/";
							}
							if (result.code == -505) {
								var new_day = false
								var day_data = result.data
							} else {
								return console.log(result)
							}
						}
						if (result.code == 0) {
							var new_day = true
						}
						for (var i = 0; i < data.length; i++) {
							var this_data = data[i]
							if (this_data.plan_date == date && this_data.check_type == "used") { //若为当天且状态为 已使用
								if (planed_day.indexOf(date) < 0) { //若为 已使用 且未遍历到
									planed = true
									if (this_data.state == "ok") {
										var state_text = "<span class='state-ok'>正常</span>"
									} else if (this_data.state == "vip") {
										var state_text = "<span class='state-vip'>会员</span>"
									} else {
										var state_text = "<span class='state-error'>无版权</span>"
									}
									plan_content += "<div class='plan' id='" + date +
										"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(this_data) +
										"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
										"</div><div class='month'>" + date_item[1] +
										"</div><div class='line'></div><div class='day'>" + date_item[2] +
										"</div></div><div class='showname'>" + this_data.showname +
										"</div><div class='realname'>" + this_data.realname +
										"</div><div class='state'>" + state_text +
										"</div><div class='cid'>cid：<span class='con-id-span'>" + this_data.cid +
										"</span></div><div class='tips'><span class='ok'>该安排已经写入历史库，无法修改！</span></div></div>"
									planed_day.push(date)
									confirmed_day.push(date)
									indb = true; //阻止函数块继续运行
								}
							}
						}
						if (indb !== true) {
							if (new_day == false) {
								if (day_data.state == "ok") {
									var state_text = "<span class='state-ok'>正常</span>"
								} else if (day_data.state == "vip") {
									var state_text = "<span class='state-vip'>会员</span>"
								} else {
									var state_text = "<span class='state-error'>无版权</span>"
								}
								plan_content += "<div class='plan' id='" + date +
									"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + "NULL" +
									"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
									"</div><div class='month'>" + date_item[1] +
									"</div><div class='line'></div><div class='day'>" + date_item[2] +
									"</div></div><div class='showname'>" + day_data.showname +
									"</div><div class='realname'>" + day_data.realname +
									"</div><div class='state'>" + state_text +
									"</div><div class='tips'><span class='warning'>该天下课铃已进行直接安排，无法编辑</span></div></div>"
							} else {
								for (var i = 0; i < data.length; i++) {
									var this_data = data[i]
									if (this_data.plan_date == date && this_data.check_type == "ready") { //若为当天且状态为 安排中
										if (planed_day.indexOf(date) < 0) { //若为 安排中 且未遍历到
											planed = true
											if (this_data.state == "ok") {
												var state_text = "<span class='state-ok'>正常</span>"
											} else if (this_data.state == "vip") {
												var state_text = "<span class='state-vip'>会员</span>"
											} else {
												var state_text = "<span class='state-error'>无版权</span>"
											}
											plan_content += "<div class='plan' id='" + date +
												"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(this_data) +
												"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
												"</div><div class='month'>" + date_item[1] +
												"</div><div class='line'></div><div class='day'>" + date_item[2] +
												"</div></div><div class='showname'>" + this_data.showname +
												"</div><div class='realname'>" + this_data.realname +
												"</div><div class='state'>" + state_text +
												"</div><div class='cid'>cid：<span class='con-id-span'>" + this_data.cid +
												"</span></div><div class='tips'><span class='ok'>该安排已确认（可修改）</span></div></div>"
											planed_day.push(date)
											submit_days.push(date)
										} else { //若为 安排中 但与之前重复
											planed = true
											re_plan.push(date)
											error_day.push(date)
										}
									}
								}
								for (var i = 0; i < data.length; i++) {
									var this_data = data[i]
									if (this_data.plan_date == date && this_data.check_type == "success") { //若为当天且状态为 已录用
										if (planed_day.indexOf(date) < 0) { //若为 已录用 且未遍历到
											if (this_data.state == "ok") {
												var state_text = "<span class='state-ok'>正常</span>"
											} else if (this_data.state == "vip") {
												var state_text = "<span class='state-vip'>会员</span>"
											} else {
												var state_text = "<span class='state-error'>无版权</span>"
											}
											planed = true
											plan_content += "<div class='plan' id='" + date +
												"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(this_data) +
												"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
												"</div><div class='month'>" + date_item[1] +
												"</div><div class='line'></div><div class='day'>" + date_item[2] +
												"</div></div><div class='showname'>" + this_data.showname +
												"</div><div class='realname'>" + this_data.realname +
												"</div><div class='state'>" + state_text +
												"</div><div class='cid'>cid：<span class='con-id-span'>" + this_data.cid +
												"</span></div><div class='tips'><span class='error'>该安排还未最终确认，请确认后重试</span></div></div>"
											planed_day.push(date)
											error_day.push(date)
										} else { //若为 已录用 但与之前重复
											planed = true
											//re_plan.push(date)
										}
									}
								}
								if (planed == false) {
									if (j < 5) {
										plan_content += "<div class='plan' id='" + date +
											"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + "NULL" +
											"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
											"</div><div class='month'>" + date_item[1] +
											"</div><div class='line'></div><div class='day'>" + date_item[2] +
											"</div></div><div class='showname'><span class='infos-empty'>该天未进行安排</span>" +
											"</div><div class='tips'><span class='warning'>该天下课铃未进行安排，提交前请务必确认</span></div></div>"
										noplan_day.push(date)
									}
								}
							}
						}
						j++;
						if (j < 7) {
							run(j)
						} else {
							var re_plan_fin = []
							for (var r = 0; r < re_plan.length; r++) {
								if (re_plan[r] !== re_plan[r - 1]) {
									re_plan_fin.push(re_plan[r])
								}
							}
							var error_day_fin = []
							for (var o = 0; o < error_day.length; o++) {
								if (error_day[o] !== error_day[o - 1]) {
									error_day_fin.push(error_day[o])
								}
							}
							var confirmed_day_fin = []
							for (var c = 0; c < confirmed_day.length; c++) {
								if (confirmed_day[c] !== confirmed_day[c - 1]) {
									confirmed_day_fin.push(confirmed_day[c])
								}
							}
							var noplan_day_fin = []
							for (var n = 0; n < noplan_day.length; n++) {
								if (noplan_day[n] !== noplan_day[n - 1]) {
									noplan_day_fin.push(noplan_day[n])
								}
							}
							var planed_day_fin = []
							for (var p = 0; p < planed_day.length; p++) {
								if (planed_day[p] !== planed_day[p - 1]) {
									planed_day_fin.push(planed_day[p])
								}
							}
							var submit_days_only = [] //需提交日期去重
							for (var s = 0; s < submit_days.length; s++) {
								if (submit_days[s] !== submit_days[s - 1]) {
									submit_days_only.push(submit_days[s])
								}
							}
							submit_days_fin = []
							for (var ef = 0; ef < error_day_fin.length; ef++) { //在需提交日期中去除有错误的日期（其实并没有什么用）
								if (submit_days_only.indexOf(error_day_fin[ef]) < 0) {

								} else {
									var num = submit_days_only.indexOf(error_day_fin[ef])
									submit_days_only = submit_days_only.splice(0, num)
								}
							}
							submit_days_fin = submit_days_only
							//console.log(submit_days_fin)
							/*console.log("re_plan_fin:" + re_plan_fin)
							console.log("noplan_day_fin:" + noplan_day_fin)
							console.log("planed_day_fin:" + planed_day_fin)*/
							plan_content += "<div class='confirm-wrap'><div class='btn-all-confirm clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn all-confirm' value='确认全部安排' id='all-confirm'></div></div><div class='btn-confirm-update clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn confirm-update' value='追加安排确认' id='confirm-update'></div></div><div class='btn-download active clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn download' value='打包下载' id='download'></div></div></div>"
							$('.plan-content').html(plan_content)
							for (var e = 0; e < re_plan_fin.length; e++) {
								var re_cid = []
								for (var i = 0; i < data.length; i++) {
									var this_data = data[i]
									if (this_data.plan_date == re_plan_fin[e]) {
										var cid = this_data.cid
										re_cid.push(cid)
									}
								}
								var re_cid_str = re_cid.join(",")
								$('.plan-content .plan#' + re_plan_fin[e] + ' .tips').html("<span class='error'>该天下课铃被重复安排，请进行修改（冲突的cid：" + re_cid_str + "）</span>")
							}
							if (error_day_fin.length !== 0) { //有错误安排-均不可用
								$('.confirm-wrap .btn-all-confirm').removeClass("active")
								$('.confirm-wrap .btn-confirm-update').removeClass("active")
							} else if (error_day_fin.length == 0) {         //无错误安排
								if (confirmed_day_fin.length == 0) {       //	-无已入库安排
									if (planed_day_fin.length == 0) {     //		-无已确认安排（没得提交）-均不可用
										$('.confirm-wrap .btn-all-confirm').removeClass("active")
										$('.confirm-wrap .btn-confirm-update').removeClass("active")
									} else {                         //		-有已确认安排-全部提交可用，追加不可用
										$('.confirm-wrap .btn-all-confirm').addClass("active")
										$('.confirm-wrap .btn-confirm-update').removeClass("active")
									}
								} else {								//	-有已入库安排
									if (planed_day_fin.length > confirmed_day_fin.length) { //		有新增安排-追加可用，全部提交不可用
										$('.confirm-wrap .btn-all-confirm').removeClass("active")
										$('.confirm-wrap .btn-confirm-update').addClass("active")
									} else { //		无新增安排-均不可用
										$('.confirm-wrap .btn-all-confirm').removeClass("active")
										$('.confirm-wrap .btn-confirm-update').removeClass("active")
									}
								}
							}
						}
					}
				})

			}
		},
		error: function (data, err) {
			console.log(err);
		}
	})
}

$(".plan-content").on('click', '.confirm-wrap .btn-all-confirm.active input', function () {
	showPopup()
	var msg = "是否确定 确认全部安排"
	$('.wrapper-popup .infos').html(msg)
	$('.wrapper-popup .btn#ok').attr("onclick", "confirmPlan('下课铃已全部确认')");
})

$(".plan-content").on('click', '.confirm-wrap .btn-confirm-update.active input', function () {
	showPopup()
	var msg = "是否确定 追加安排确认"
	$('.wrapper-popup .infos').html(msg)
	$('.wrapper-popup .btn#ok').attr("onclick", "confirmPlan('追加确认完成')");
})

$(".plan-content").on('click', '.confirm-wrap .btn-download.active input', function () {
	showPopup()
	var msg = "是否确定 打包下载"
	$('.wrapper-popup .infos').html(msg)
	$('.wrapper-popup .btn#ok').attr("onclick", "Download()");
})

function confirmPlan(msg) {
	hidePopup()
	for (var i = 0; i < submit_days_fin.length; i++) {
		var date = submit_days_fin[i]
		var con_infos = JSON.parse($(".plan-content .plan#" + date + " .plan-infos .infos .data").html())

		var data = {
			cid: con_infos.cid
		}
		$.ajax({
			url: '/admin/confirmplan',
			type: 'post',
			data: data,
			success: function (data, status) {
				if (data.code !== 0) {
					if (data.code == -502) {
						alert('请先登录')
						return window.location.reload()
					}
					if (data.code == -510) {
						alert('您不是管理员')
						return window.location.href = "/";
					}
					if (data.code == -503) {
						alert(data.message)
					}
					return console.log(data)
				}
			},
			error: function (data, err) {
				return console.log(err);
			}
		})
	}
	showPopup()
	$('.wrapper-popup .infos').html(msg)
	getContribution()
	$('.wrapper-popup .btn#cancel').hide()
	$('.wrapper-popup .btn#ok').attr("onclick", "checkReset()");
	$('.wrapper-popup').attr("onclick", "checkReset()");
}

function Download() {
	hidePopup()
	showPopup()
	$('.wrapper-popup .btn#ok').hide();
	$('.wrapper-popup .btn#cancel').hide()
	$('.wrapper-popup .infos').html("<div style='text-align: center;'><p><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></p><p>下载中</p></div>")
	var week = parseInt($(".plan-info .class-text").attr("week"))
	//week = week - 1
	var now = new Date();
	var nowTime = now.getTime();
	var day = now.getDay();
	var oneDayTime = 24 * 60 * 60 * 1000;
	var Nowtime = new Date()
	var week_num = week
	if (day === 0) {
		day = 7
	}
	var MonTime = nowTime - (day - 1 - week_num * 7) * oneDayTime;
	var SunTime = nowTime - (day - 7 - week_num * 7) * oneDayTime;
	var day_1 = new Date(MonTime).Format("yyyy-MM-dd");
	var day_7 = new Date(SunTime).Format("yyyy-MM-dd");
	var data = {
		start: day_1,
		end: day_7
	}
	$.ajax({
		url: '/admin/download',
		type: 'post',
		data: data,
		success: function (data, status) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return window.location.reload()
				}
				if (data.code == -510) {
					alert('您不是管理员')
					return window.location.href = "/";
				}
				if (data.code == -503) {
					alert(data.message)
				}
				return console.log(data)
			}
			var url = data.url
			window.location = url;
			return hidePopup()
		},
		error: function (data, err) {
			console.log(err);
			return hidePopup()
		}
	})
}