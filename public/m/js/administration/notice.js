
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
				alert('您不是管理员')
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
				alert('您不是管理员')
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


$(document).on('click', '.get-now-time', function () {
	GetNowtime()
});

function GetNowtime(){
	var Nowtime = new Date().Format("yyyy-MM-dd HH:mm:ss");
	$('input#time').val(Nowtime);
	$('.time-wrap').addClass('input-filled')
}


function getContent(type){
	if(!type){
		var type = "publish"
	}else{
		var type = type;
	}
	$(".notices-sidebar .list .list-item").removeClass("active")
	$(".notices-sidebar .list .list-item#" + type + "").addClass("active")
	if(type == "publish"){
		$.get("/user/infos", function (data, err) {
			if (data.code !== 0) {
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.data.type !== "super") {
					alert('您不是管理员')
					return window.location.href='/'
				}
				return console.log(data)
			}
			var content = ""
			content = "<div class='publish-wrap'><div class='edit-wrap'><div class='input-rows'><div class='input-label'>公告标题:</div><div class='input-wrap middle title-wrap'><span class='input-span'><input type='text' class='editable' id='title' autocomplete='on'placeholder='公告标题' /></span><span class='clear-span title-clear'>×</span></div><p class='message' id='title'></p></div><div class='input-rows'><div class='input-label'>发布署名:</div><div class='input-wrap middle auther-wrap'><span class='input-span'><input type='text' class='editable' id='auther' autocomplete='on'placeholder='发布署名' /></span><span class='clear-span auther -clear'>×</span></div><p class='message' id='auther'></p></div><div class='input-rows'><div class='input-label'>发布时间:</div><div class='input-wrap middle time-wrap'><span class='input-span'><input type='text' class='editable' id='time' autocomplete='on'placeholder='发布时间' /></span><span class='clear-span time-clear'>×</span></div><p class='message' id='time'></p><div class='get-now-time' title='填入当前时间'><span class='get-now-time-span'><i class='fa fa-clock-o fa-lg'></i></span></div></div><div class='input-rows'><div class='input-label'>发布对象:</div><div class='input-wrap middle to-user-wrap'><span class='input-span'><input type='text' class='readonly' id='to-user' autocomplete='on'placeholder='发布对象' readonly='readonly' value='全体（暂不支持修改）'/></span><!--<span class='clear-span to-user-clear'>×</span>--></div><p class='message' id='to-user'></p></div><div class='textarea-wrap'><textarea id='text-md' rows='15' cols='100' placeholder='公告内容（markdown语法格式）'></textarea></div></div><div class='btn-preview'><div class='input-wrap-btn middle'><input type='button' class='btn btn-get' value='预览' id='preview' onclick='getPreview()'></div></div><div class='preview-wrap'></div></div>"
			return $(".notices-content .list").html(content)
		})
	}
	if(type == "archive"){
		return $(".notices-content .list").html("<div class='not-open'><p>该功能暂未开放哟~</p><p>如有必要需求，请发邮件至evanchen486@163.com</p></div>")
	}
}

function getPreview(){
	var title = $(".title-wrap input#title").val()
	var time = $(".time-wrap input#time").val()
	var date = time.split(" ")[0]
	var val_time = time.split(":")[0] + ":" + time.split(":")[1]
	var content = marked($("#text-md").val())
	var auther = $(".auther-wrap input#auther").val()
	if(auther){
		var auther_text = "<div class='notice-user' id='notice-user-preview' style='text-align: right'>发布者：" + auther + "</div>"
	}else{
		var auther_text = ""
	}
	var notice_content = ""
	notice_content += "<div class='notice-wrap' id='notice-wrap-preview'><span class='notice-datetag' id='notice-datetag-preview'>" + date + 
	"</span><div class='notice-title' id='notice-title-preview'><h2>" + title + 
	"</h2></div><div class='notice-contnent' id='notice-contnent-preview'><p>" + content + 
	"</p></div><div class='notice-time' id='notice-user-preview' style='text-align: right'>发布时间：" + val_time + 
	"</div>" + auther_text + "</div>"
	notice_content += "<div class='btn-publish'><div class='input-wrap-btn middle'><input type='button' class='btn btn-get' value='发布' id='publish' onclick='Publish()'></div></div>"
	return $(".notices-content .list .preview-wrap").html(notice_content)
}

function Publish(){
	var title = $(".title-wrap input#title").val()
	var time = $(".time-wrap input#time").val()
	var date = time.split(" ")[0]
	var val_time = time.split(":")[0] + ":" + time.split(":")[1]
	var content = marked($("#text-md").val())
	if($(".auther-wrap input#auther").val()){
		var auther = $(".auther-wrap input#auther").val()
	}else{
		var auther = null
	}
	var data = {
		title: title,
		time: time,
		to_user: "all",
		content: content,
		auther: auther
	}
	$.ajax({
        url: '/notice/publish',
        type: 'post',
		data: data,
        success: function (data, status) {
            if (data.code !== 0) {
                if (data.code == -502) {
                    alert('请先登录')
                    showQuickLogin()
                }
				if (data.code == -510) {
					alert('您的权限不足')
					return window.location.href='/'
				}
                return console.log(data)
            }
			alert('发布成功')
			return window.location.reload()
        },
        error: function (data, err) {
            console.log(err);
        }
    })
}