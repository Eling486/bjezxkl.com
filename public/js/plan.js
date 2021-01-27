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

function getPlan() {
	var now = new Date();
	var nowTime = now.getTime();
	var day = now.getDay();
	var oneDayTime = 24 * 60 * 60 * 1000;
	var Nowtime = new Date()
	//获得周一到周日时间
	/*if(day === 0){
		day = 0
	}*/
	var MonTime = nowTime - (day - 1) * oneDayTime;
	var TueTime = nowTime - (day - 2) * oneDayTime;
	var WedTime = nowTime - (day - 3) * oneDayTime;
	var ThuTime = nowTime - (day - 4) * oneDayTime;
	var FriTime = nowTime - (day - 5) * oneDayTime;
	var SatTime = nowTime - (day - 6) * oneDayTime;
	var SunTime = nowTime - (day - 7) * oneDayTime;

	//格式转换
	var day_1 = new Date(MonTime).Format("yyyy-MM-dd");
	var day_2 = new Date(TueTime).Format("yyyy-MM-dd");
	var day_3 = new Date(WedTime).Format("yyyy-MM-dd");
	var day_4 = new Date(ThuTime).Format("yyyy-MM-dd");
	var day_5 = new Date(FriTime).Format("yyyy-MM-dd");
	var day_6 = new Date(SatTime).Format("yyyy-MM-dd");
	var day_7 = new Date(SunTime).Format("yyyy-MM-dd");

	$.get("/music/plan", function (data, err) {
		if (data.code !== 0) {
			return console.log(data)
		}
		var data = data.data
		var days = [day_1,day_2,day_3,day_4,day_5,day_6,day_7]
		var weekdays = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"]
		var plan_content = ""
		if(data.length == 0){
			plan_content = "<div class='plan' id='none'><p class='plan-empty' id='1'>—— 这周一个安排也没有呢 ——</p><div class='plan-empty' id='2'>是不是放假了呢？<s>（也有可能是要考试了呀）</s></div></div>"
			return $('.plan-wrap').html(plan_content);
		}
		for (var j = 0; j < 7; j++){
			var date = days[j]
			var date_item = date.split("-")
			var weekday = weekdays[j]
			var hasplan = false;
			for (var i = 0; i < data.length; i++){
				if(data[i].date == date){
					var this_data = data[i]
					if (this_data.showname == ""){
						var showname_text = "<span class='plan-empty'>（不知道为什么没有名字呢）</span>"
					}else{
						var showname_text = this_data.showname
					}
					plan_content += "<div class='plan-content' id='" + date + 
					"'><div class='plan-date'><div class='plan-weekday'>" + weekday + 
					"</div><div class='plan-month'>" + date_item[1] + 
					"</div><div class='plan-line'></div><div class='plan-day'>" + date_item[2] + "</div></div><div class='showname'>" + showname_text + 
					"</div>"
					if( this_data.con_user !== ""){
						plan_content += "<div class='con-user'>投稿人：" + this_data.con_user + "</div></div>"
					}else{
						plan_content += "</div>"
					}
					hasplan = true;
				}
			}
			if(hasplan == false){
				if (j < 5){
					plan_content += "<div class='plan-content' id='" + date + 
						"'><div class='plan-date'><div class='plan-weekday'>" + weekday + 
						"</div><div class='plan-month'>" + date_item[1] + 
						"</div><div class='plan-line'></div><div class='plan-day'>" + date_item[2] + "</div></div><div class='showname'><span class='plan-empty'>（今天没有下课铃哦）</span></div></div>"
				}
			}
		}
		$(".plan-wrap").html(plan_content)
	})
}