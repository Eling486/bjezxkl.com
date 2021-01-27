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
		getPlanConfirm(1)
		$('.plan-wrap').show()
	})
}

$('body').on('click', '.wrapper-popup', function () {
	$('.wrapper-popup .content .close').trigger("click");
})
$('.wrapper-popup').on('click', '.content', function (e) {
	e.stopPropagation();
})

//空位补0
function PrefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
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
	$(".plan-info .class-text").attr("week",week)
	//console.log(week)
	getPlanConfirm(week)
})
$(".plan-info").on('click', '.btn#next-week', function () {
	var week = parseInt($(".plan-info .class-text").attr("week"))
	week = week + 1
	$(".plan-info .class-text").attr("week",week)
	//console.log(week)
	getPlanConfirm(week)
})

var submit_days_fin = []

function getPlanConfirm(week){
	$(".plan-content").html("<div class='list-loading'><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>")
	//week = 1 ->下周
	var now = new Date();
	var nowTime = now.getTime();
	var day = now.getDay();
	var oneDayTime = 24 * 60 * 60 * 1000;
	var Nowtime = new Date()
	var week_num = week
	//获得周一到周日时间
	if(day === 0){
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
			var days = [day_1,day_2,day_3,day_4,day_5,day_6,day_7]
			var weekdays = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"]
			var plan_content = ""
			//console.log(data)
			if(data.length == 0){
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
			
			function run(j){
				var weekday = weekdays[j]
				var date = days[j]
				var date_item = date.split("-")
				var planed = false
				var indb = false
				var date_data = {date: date}
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
							if (result.code == -505){
								var new_day = false
								var day_data = result.data
							}else{
								return console.log(result)
							}
						}
						if(result.code == 0){
							var new_day = true
						}
						for (var i = 0; i < data.length; i++){
							var this_data = data[i]
							if(this_data.plan_date == date && this_data.check_type == "used"){ //若为当天且状态为 已使用
								if(planed_day.indexOf(date) < 0){ //若为 已使用 且未遍历到
									planed = true
									if(this_data.state == "ok"){
										var state_text = "<span class='state-ok'>正常</span>"
									}else if(this_data.state == "vip"){
										var state_text = "<span class='state-vip'>会员</span>"
									}else{
										var state_text = "<span class='state-error'>无版权</span>"
									}
									plan_content += "<div class='plan' id='"+ date +
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
						if(indb !== true){
							if(new_day == false){
								if(day_data.state == "ok"){
									var state_text = "<span class='state-ok'>正常</span>"
								}else if(day_data.state == "vip"){
									var state_text = "<span class='state-vip'>会员</span>"
								}else{
									var state_text = "<span class='state-error'>无版权</span>"
								}
								plan_content += "<div class='plan' id='"+ date +
									"'><div class='plan-infos' style='display: none;'><ul class='infos'><li class='data'>" + "NULL" +
									"</li></ul></div><div class='plan-time'><div class='weekday'>" + weekday +
									"</div><div class='month'>" + date_item[1] + 
									"</div><div class='line'></div><div class='day'>" + date_item[2] + 
									"</div></div><div class='showname'>" + day_data.showname + 
									"</div><div class='realname'>" + day_data.realname + 
									"</div><div class='state'>" + state_text + 
									"</div><div class='tips'><span class='warning'>该天下课铃已进行直接安排，无法编辑</span></div></div>"
							}else{
								for (var i = 0; i < data.length; i++){
									var this_data = data[i]
									if(this_data.plan_date == date && this_data.check_type == "ready"){ //若为当天且状态为 安排中
										if(planed_day.indexOf(date) < 0){ //若为 安排中 且未遍历到
											planed = true
											if(this_data.state == "ok"){
												var state_text = "<span class='state-ok'>正常</span>"
											}else if(this_data.state == "vip"){
												var state_text = "<span class='state-vip'>会员</span>"
											}else{
												var state_text = "<span class='state-error'>无版权</span>"
											}
											plan_content += "<div class='plan' id='"+ date +
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
										}else{ //若为 安排中 但与之前重复
											planed = true
											re_plan.push(date)
											error_day.push(date)
										}
									}
								}
								for (var i = 0; i < data.length; i++){
									var this_data = data[i]
									if(this_data.plan_date == date && this_data.check_type == "success"){ //若为当天且状态为 已录用
										if(planed_day.indexOf(date) < 0){ //若为 已录用 且未遍历到
											if(this_data.state == "ok"){
												var state_text = "<span class='state-ok'>正常</span>"
											}else if(this_data.state == "vip"){
												var state_text = "<span class='state-vip'>会员</span>"
											}else{
												var state_text = "<span class='state-error'>无版权</span>"
											}
											planed = true
											plan_content += "<div class='plan' id='"+ date +
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
										}else{ //若为 已录用 但与之前重复
											planed = true
											//re_plan.push(date)
										}
									}
								}
								if(planed == false){
									if(j < 5){
										plan_content += "<div class='plan' id='"+ date +
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
						if(j < 7){
							run(j)
						}else{
							var re_plan_fin = []
							for (var r = 0 ; r < re_plan.length ; r++){
								if(re_plan[r] !== re_plan[r - 1]) {
									re_plan_fin.push(re_plan[r])
								}
							}
							var error_day_fin = []
							for (var o = 0 ; o < error_day.length ; o++){
								if(error_day[o] !== error_day[o - 1]) {
									error_day_fin.push(error_day[o])
								}
							}
							var confirmed_day_fin = []
							for (var c = 0 ; c < confirmed_day.length ; c++){
								if(confirmed_day[c] !== confirmed_day[c - 1]) {
									confirmed_day_fin.push(confirmed_day[c])
								}
							}
							var noplan_day_fin = []
							for (var n = 0 ; n < noplan_day.length ; n++){
								if(noplan_day[n] !== noplan_day[n - 1]) {
									noplan_day_fin.push(noplan_day[n])
								}
							}
							var planed_day_fin = []
							for (var p = 0 ; p < planed_day.length ; p++){
								if(planed_day[p] !== planed_day[p - 1]) {
									planed_day_fin.push(planed_day[p])
								}
							}
							var submit_days_only = [] //需提交日期去重
							for (var s = 0 ; s < submit_days.length ; s++){
								if(submit_days[s] !== submit_days[s - 1]) {
									submit_days_only.push(submit_days[s])
								}
							}
							submit_days_fin = []
							for (var ef = 0 ; ef < error_day_fin.length ; ef++){ //在需提交日期中去除有错误的日期（其实并没有什么用）
								if(submit_days_only.indexOf(error_day_fin[ef]) < 0) {
									
								}else{
									var num = submit_days_only.indexOf(error_day_fin[ef])
									submit_days_only = submit_days_only.splice(0,num)
								}
							}
							submit_days_fin = submit_days_only
							//console.log(submit_days_fin)
							/*console.log("re_plan_fin:" + re_plan_fin)
							console.log("noplan_day_fin:" + noplan_day_fin)
							console.log("planed_day_fin:" + planed_day_fin)*/
							plan_content += "<div class='confirm-wrap'><div class='btn-all-confirm clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn all-confirm' value='确认全部安排' id='all-confirm'></div></div><div class='btn-confirm-update clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn confirm-update' value='追加安排确认' id='confirm-update'></div></div><div class='btn-download active clearfix'><div class='input-wrap-btn middle'><input type='button' class='btn download' value='打包下载' id='download'></div></div></div>"
							$('.plan-content').html(plan_content)
							for( var e = 0 ; e < re_plan_fin.length ; e++){
								var re_cid = []
								for (var i = 0; i < data.length; i++){
									var this_data = data[i]
									if( this_data.plan_date == re_plan_fin[e]){
										var cid = this_data.cid
										re_cid.push(cid)
									}
								}
								var re_cid_str = re_cid.join(",")
								$('.plan-content .plan#' + re_plan_fin[e] + ' .tips').html("<span class='error'>该天下课铃被重复安排，请进行修改（冲突的cid：" + re_cid_str + "）</span>")
							}
							if(error_day_fin.length !== 0){ //有错误安排-均不可用
								$('.confirm-wrap .btn-all-confirm').removeClass("active")
								$('.confirm-wrap .btn-confirm-update').removeClass("active")
							}else if(error_day_fin.length == 0){         //无错误安排
								if(confirmed_day_fin.length == 0){       //	-无已入库安排
									if (planed_day_fin.length == 0){     //		-无已确认安排（没得提交）-均不可用
										$('.confirm-wrap .btn-all-confirm').removeClass("active")
										$('.confirm-wrap .btn-confirm-update').removeClass("active")
									}else{                         //		-有已确认安排-全部提交可用，追加不可用
										$('.confirm-wrap .btn-all-confirm').addClass("active")
										$('.confirm-wrap .btn-confirm-update').removeClass("active")
									}
								}else{								//	-有已入库安排
									if (planed_day_fin.length > confirmed_day_fin.length){ //		有新增安排-追加可用，全部提交不可用
										$('.confirm-wrap .btn-all-confirm').removeClass("active")
										$('.confirm-wrap .btn-confirm-update').addClass("active")
									}else{ //		无新增安排-均不可用
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

function confirmPlan(msg){
	hidePopup()
	for(var i = 0; i < submit_days_fin.length; i++){
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

function Download(){
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
	if(day === 0){
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