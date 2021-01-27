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
			if (data.data.type !== "super") {
				alert('您不是超级管理员')
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
			if (data.data.type !== "super") {
				alert('您不是超级管理员')
				return window.location.href='/'
			}
			return console.log(data)
		}
		$(".user-center-content .list").html("<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i>")
		var hash = window.location.hash.split("/")[1]
		getContent(hash)
	})
}

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

function getContent(type){
	if(!type){
		var type = "replenish"
	}else{
		var type = type;
	}
	$(".archive-sidebar .list .list-item").removeClass("active")
	$(".archive-sidebar .list .list-item#" + type + "").addClass("active")
	if(type == "replenish"){
		$(".archive-content .title").html("音乐补全")
		$.get("/user/infos", function (data, err) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.data.type !== "super") {
					alert('您不是超级管理员')
					return window.location.href='/'
				}
				return console.log(data)
			}
			var content = ""
			content += "<div class='list-title'><div class='music-ncmid'>网易云ID</div><div class='music-realname'>实际名称</div><div class='music-artist'>音乐人</div><div class='music-state'>状态</div><div class='btn-upload'>操作</div></div>"
			$.get("/admin/archive/history", function (data, err) {
				if (data.code !== 0) {
					if (data.code == -502) {
						alert('请先登录')
						return showQuickLogin()
					}
					if (data.code == -510) {
						alert('您不是超级管理员')
						return window.location.href='/'
					}
					return console.log(data)
				}
				data = data.data
				for(var i = 0; i < data.length; i++){
					this_data = data[i]
					if(this_data.state == "vip"){
						var state_text = "<span class='state-vip'>会员</span>"
					}else{
						var state_text = "<span class='state-error'>无版权</span>"
					}
					content += "<div class='list-item list-item-" + this_data.ncmid + 
					"' data-ncmid='" + this_data.ncmid + 
					"'><div class='music-ncmid'>" + this_data.ncmid +
					"</div><div class='music-realname'>" + this_data.realname +
					"</div><div class='music-artist'>" + this_data.artist + 
					"</div><div class='music-state'>" + state_text + 
					"</div><div class='btn-upload'><span class='btn' id='upload'>上传</span><input style='display: none;' type='file' accept='.mp3' class='input-file' id='upload-file' /></div></div>"
					//"</div><div class='btn-upload'><span class='btn' id='upload'>上传</span></div></div>"
				}
				return $(".archive-content .list").html(content)
			})
		})
	}
	if(type == "update"){
		$(".archive-content .title").html("状态更新")
		return $(".archive-content .list").html("<div class='btn-update clearfix' style='margin-top: 30px;'><div class='input-wrap-btn middle'><input type='button' class='btn btn-update' value='更新状态' id='update' onclick='updateState()' /></div></div>")
	}
	if(type == "create"){
		$(".archive-content .title").html("添加数据")
		return $(".archive-content .list").html("<div class='create-wrap'><div class='input-rows'><div class='input-label'>播放日期:</div><div class='input-wrap large date-wrap'><span class='input-span'><input type='text' class='editable' id='date' autocomplete='on' placeholder='播放日期' /></span><span class='clear-span date-clear'>×</span></div><p class='message' id='date'></p></div><div class='input-rows'><div class='input-label'>播放周:</div><div class='input-wrap large week-wrap'><span class='input-span'><input type='text' class='editable' id='week' autocomplete='off' placeholder='播放周' /></span><span class='clear-span week-clear'>×</span></div><p class='message' id='week'></p></div><div class='input-rows'><div class='input-label'>版权状态:</div><div class='input-wrap large state-wrap'><span class='input-span'><input type='text' class='editable' id='state' autocomplete='off' placeholder='版权状态' oninput='stateTest()' onchange='stateTest()'/></span><span class='clear-span state-clear'>×</span></div><p class='message' id='state'></p></div><div class='input-rows' style='display: none;'><div class='input-label'>网易云ID:</div><div class='input-wrap large ncmid-wrap'><span class='input-span'><input type='text' class='editable' id='ncmid' autocomplete='off' placeholder='网易云ID' /></span><span class='clear-span ncmid-clear'>×</span></div><p class='message' id='ncmid'></p></div><div class='input-rows'><div class='input-label'>显示名称:</div><div class='input-wrap large showname-wrap'><span class='input-span'><input type='text' class='editable' id='showname' autocomplete='off' placeholder='显示名称' /></span><span class='clear-span showname-clear'>×</span></div><p class='message' id='showname'></p></div><div class='input-rows'><div class='input-label'>实际名称:</div><div class='input-wrap large realname-wrap'><span class='input-span'><input type='text' class='editable' id='realname' autocomplete='off' placeholder='实际名称' /></span><span class='clear-span realname-clear'>×</span></div><p class='message' id='realname'></p></div><div class='input-rows'><div class='input-label'>音乐人:</div><div class='input-wrap large artist-wrap'><span class='input-span'><input type='text' class='editable' id='artist' autocomplete='off' placeholder='音乐人' /></span><span class='clear-span artist-clear'>×</span></div><p class='message' id='artist'></p></div><div class='btn-create'><div class='input-wrap-btn large'><input type='button' class='btn btn-create' value='添加' id='create' onclick='createMusic()'></div></div></div>")
	}
}

function updateState(){
	showPopup()
	$('.wrapper-popup .btn#ok').hide();
	$('.wrapper-popup .btn#cancel').hide()
	$('.wrapper-popup .infos').html("<div style='text-align: center;'><p><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></p><p>更新中，请耐心等待</p></div>")
	$.ajax({
		url : '/admin/archive/update', 
		type: 'post',
		success : function(data) {    
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.code == -510) {
					alert('您不是超级管理员')
					return window.location.href='/'
				}
			}
			data = data.data
			var update_log = ""
			if(data.length > 0){
				for(var i = 0; i < data.length; i++){
					update_log += "\n" + data[i]
				}
			}
			alert('更新成功' + update_log)
			hidePopup()
		},    
		error : function() {
			alert('更新失败')
			hidePopup()
		}
	})	
}

$(document).on('click', 'span.btn#upload', function () {
	$(this).siblings('input').trigger("click");
})

$(document).on('change', '#upload-file', function() {
	var ncmid = $(this).parent().parent().attr("data-ncmid");
	var data = new FormData();
	data.append("ncmid", ncmid);
	data.append("file", $(this)[0].files[0]);
	$.ajax({
		url : "/admin/archive/upload", 
		cache: false,
		type: 'post',
		dataType: 'json',
		data : data,
		contentType: false,
		processData: false,
		success : function(data) {    
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.code == -510) {
					alert('您不是超级管理员')
					return window.location.href='/'
				}
				alert('上传失败')
				getContent("replenish")
			}
			alert('上传成功')
			getContent("replenish")
		},    
		error : function() {
			alert('上传失败')
			getContent("replenish") 
		}    
   });
});

function stateTest(){
	var state = $("input#state").val()
	if(state == "ok" || state == "vip" || state == "error"){
		$(".ncmid-wrap").siblings(".input-label").html("网易云ID:")
		$("input#ncmid").attr("placeholder", "网易云ID:")
		$("input#ncmid").val("")
		return $(".ncmid-wrap").parent().fadeIn()
	}
	if(state == "local"){
		$(".ncmid-wrap").siblings(".input-label").html("数据ID:")
		$("input#ncmid").attr("placeholder", "数据ID:")
		$("input#ncmid").val("")
		return $(".ncmid-wrap").parent().fadeOut()
	}
	$("input#ncmid").val("")
	return $(".ncmid-wrap").parent().fadeOut()
}
function createMusic(){
	$(".message").html("")
	var date = $("input#date").val()
	var week = $("input#week").val()
	var state = $("input#state").val()
	var ncmid = $("input#ncmid").val()
	var showname = $("input#showname").val()
	var realname = $("input#realname").val()
	var artist = $("input#artist").val()
	if(!date){
		return $(".message#date").html("请输入播放日期")
	}
	if(!week){
		return $(".message#week").html("请输入播放周")
	}
	if(!state){
		return $(".message#state").html("请输入版权状态")
	}
	if(!showname){
		return $(".message#showname").html("请输入显示名称")
	}
	if(!realname){
		return $(".message#realname").html("请输入实际名称")
	}
	if(!artist){
		return $(".message#artist").html("请输入音乐人")
	}
	if(state == "ok" || state == "vip" || state == "error"){
		if(!ncmid){
			return $(".message#ncmid").html("请输入网易云ID")
		}
	}else if(state == "local"){
		var ncmid = date.split("-")[0] + date.split("-")[1] + date.split("-")[2] + "00"
	}else{
		return $(".message#state").html("不合法的版权状态（仅支持：ok, vip, error, local）")
	}
	var res = confirm("是否确认添加数据（不可撤销）")
	if(res){
		var data = {
			date: date,
			week: week,
			ncmid: ncmid,
			state: state,
			showname: showname,
			realname: realname,
			artist: artist,
		}
		$.ajax({
			url: '/admin/create',
			type: 'post',
			data: data,
			success: function (data, status) {
				if (data.code !== 0) {
					if (data.code == -502) {
						alert('请先登录')
						return showQuickLogin()
					}
					if (data.code == -510) {
						return alert("您不是超级管理员")
					}
					return console.log(data)
				}
				alert("添加成功！")
				$(".input-rows .clear-span").trigger("click");
			},
			error: function (data, err) {
				console.log(err);
			}
		})
	}
}