
function pageLoaded(){
	$.get("/notice/get", function (data, err) {
		if (data.code !== 0) {
			return console.log(data)
		}
		if(data.data.length == 0){
			$(".notices-wrap").html('')
			return console.log('无公告')
		}
		var rows = data.data
			rows.sort(function (a, b) {
				return Date.parse(b.time) - Date.parse(a.time);//时间倒序
			});
			data = rows;
		if(data.length == 0){
			var notice_content = ""
			return $(".notices-wrap").html(notice_content)
		}
		var notice_content = "<div class='notices-title'><h1>—— 近期公告 ——</h1></div>"
		for(var i = 0; i < data.length; i++){
			var nid = data[i].title
			var title = data[i].title
			var time = data[i].time
			var date = time.split(" ")[0]
			var val_time = time.split(":")[0] + ":" + time.split(":")[1]
			var content = data[i].content
			var auther = data[i].auther
			if(auther){
				var auther_text = "<div class='notice-user' style='text-align: right'>发布者：" + auther + "</div>"
			}else{
				var auther_text = ""
			}
			notice_content += "<div class='notice-wrap' id='nid-" + nid +
			"'><span class='notice-datetag'>" + date + 
			"</span><div class='notice-title'><h2>" + title + 
			"</h2></div><div class='notice-contnent'><p>" + content + 
			"</p></div><div class='notice-time' style='text-align: right'>发布时间：" + val_time + 
			"</div>" + auther_text + "</div>"
		}
		return $(".notices-wrap").html(notice_content)
	})
}