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

function loginFailed() {
	pageLoaded()
}

function loginSucceeded() {
	pageLoaded()
}

var user_error = 0
function pageLoaded(){
	var key = "week"
	user_error = 0
	getUserChart(key)
	getConChart(key)
	getVisitChart(key)
}

$('.con-charts').on('click', '.range-tab', function () {
	var key = $(this).attr('id')
	$('.con-charts .range-tab').removeClass("active");
	$(this).addClass("active");
	user_error = 0
	getConChart(key)
})

$('.user-charts').on('click', '.range-tab', function () {
	var key = $(this).attr('id')
	$('.user-charts .range-tab').removeClass("active");
	$(this).addClass("active");
	user_error = 0
	getUserChart(key)
})

$('.visit-charts').on('click', '.range-tab', function () {
	var key = $(this).attr('id')
	$('.visit-charts .range-tab').removeClass("active");
	$(this).addClass("active");
	user_error = 0
	getVisitChart(key)
})

function _getMaxValue(arr) {
  const max = Math.max(...arr);
  // 这样处理是为了不让最大值刚好到坐标轴最顶部
  return Math.ceil(max / 9.5) * 10;
}
function _getMinValue(arr) {
  const min = Math.min(...arr);
  // 这样处理是为了不让最大值刚好到坐标轴最底部
  return Math.floor(min / 12) * 10;
}

function getConChart(key){
	var now = new Date();
	var nowTime = now.getTime();
	var oneDayTime = 24 * 60 * 60 * 1000;
	
	var conChart = echarts.init(document.getElementById("con-chart"), 'walden');
	$.get("/statistic/contribution/" + key, function (data, err) {
		if (data.code !== 0) {
			if(user_error == 0){
				user_error = 1
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.code == -510) {
					alert('您不是超级管理员')
					return window.location.href = "/";
				}
				return console.log(data)
			}
		}
		if(key == "week"){
			var date_num = 7
		}else if(key == "twoweeks"){
			var date_num = 14
		}else if(key == "month"){
			var date_num = 30
		}else if(key == "year"){
			var date_num = 365
		}
		var date_list = []
		var con_num_list = []
		var con_new_list = []
		var check_new_list = []
		for(var i = 0; i < date_num; i++){
			var time = nowTime - i * oneDayTime;
			var date = new Date(time).Format("yyyy-MM-dd");
			date_list.push(date)
		}
		date_list.reverse() //数组倒序（日期从小到大）
		
		if(data.data_con[0]){
			for(var j = 0; j < date_list.length; j++){
				var this_con_num = 0
				var this_con_new = 0
				for(var i = 0; i < data.data_con.length; i++){
					var this_date = data.data_con[i].con_date
					var this_con_num_data = data.data_con[i].con_num
					var this_con_new_data = data.data_con[i].con_new
					if(date_list[j] == this_date){
						this_con_new = this_con_new_data
						this_con_num = this_con_num_data
					}
				}
				if(this_con_new == 0 && j == 0){
					//若为首个遍历且无数据
					con_new_list.push(this_con_new)
					con_num_list.push(data.data_con[0].con_num - data.data_con[0].con_new)
				}
				if(this_con_new == 0 && j !== 0){
					//若为后续遍历且无数据
					con_new_list.push(this_con_new)
					con_num_list.push(con_num_list[j - 1])
				}
				if(this_con_new !== 0){
					//若存在数据
					con_new_list.push(this_con_new)
					con_num_list.push(this_con_num)
				}	
			}
		}else{
			var this_con_num = data.data_con
			var this_con_new = 0
			for(var j = 0; j < date_list.length; j++){
				con_new_list.push(this_con_new)
				con_num_list.push(this_con_num)
			}
		}
		//新增审核数数组遍历
		for(var j = 0; j < date_list.length; j++){
			var this_num = 0
			for(var i = 0; i < data.data_check.length; i++){
				var this_date = data.data_check[i].check_date
				var this_data = data.data_check[i].check_new
				if(date_list[j] == this_date){
					this_num = this_data
				}
			}
			check_new_list.push(this_num)
		}
		var con_list = con_new_list.concat(check_new_list);
		const min1 = _getMinValue(con_list),
			  min2 = _getMinValue(con_num_list),
			  max1 = _getMaxValue(con_list),
			  max2 = _getMaxValue(con_num_list);
			  
		var option = {
			title: {
				text: '稿件相关统计',
				textStyle:{
					color:'#1565c0',
					fontStyle:'normal',
					fontWeight:'bold',
				}
			},
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ['投稿总数', '新增投稿数', '新增审核数']
			},
			grid: {
				left: '5%',
				right: '8%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {}
				}
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: date_list
			},
			yAxis: [{
				name: '新增数/个',
				type: 'value',
				min: min1,
				max: max1,
				splitNumber: 5,
				interval: (max1 - min1) / 5,
			},
			{
				name: '总数/个',
				type: 'value',
				min: min2,
				max: max2,
				splitNumber: 5,
				interval: (max2 - min2) / 5,
			}],
			series: [
				{
					name: "投稿总数",
					data: con_num_list,
					type: 'line',
					smooth: true,
					areaStyle: {},
					showSymbol: false,
					yAxisIndex: 1,
				},
				{
					name: "新增投稿数",
					data: con_new_list,
					type: 'line',
					smooth: true,
					showSymbol: false
				},
				{
					name: "新增审核数",
					data: check_new_list,
					type: 'line',
					smooth: true,
					showSymbol: false
				}
			]
		}

        // 使用刚指定的配置项和数据显示图表。
        conChart.setOption(option);
	})
}

function getUserChart(key){
	var now = new Date();
	var nowTime = now.getTime();
	var oneDayTime = 24 * 60 * 60 * 1000;
	
	var userChart = echarts.init(document.getElementById("user-chart"), 'walden');
	$.get("/statistic/user/" + key, function (data, err) {
		if (data.code !== 0) {
			if(user_error == 0){
				user_error = 1
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.code == -510) {
					alert('您不是超级管理员')
					return window.location.href = "/";
				}
				return console.log(data)
			}
		}
		if(key == "week"){
			var date_num = 7
		}else if(key == "twoweeks"){
			var date_num = 14
		}else if(key == "month"){
			var date_num = 30
		}else if(key == "year"){
			var date_num = 365
		}
		var date_list = []
		var user_num_list = []
		var user_new_list = []
		for(var i = 0; i < date_num; i++){
			var time = nowTime - i * oneDayTime;
			var date = new Date(time).Format("yyyy-MM-dd");
			date_list.push(date)
		}
		date_list.reverse() //数组倒序（日期从小到大）
		if(data.user){
			for(var j = 0; j < date_list.length; j++){
				var this_user_num = 0
				var this_user_new = 0
				for(var i = 0; i < data.user.length; i++){
					var this_date = data.user[i].reg_date
					var this_user_num_data = data.user[i].reg_num
					var this_user_new_data = data.user[i].reg_new
					if(date_list[j] == this_date){
						this_user_new = this_user_new_data
						this_user_num = this_user_num_data
					}
				}
				if(this_user_new == 0 && j == 0){
					//若为首个遍历且无数据
					user_new_list.push(this_user_new)
					user_num_list.push(data.user[0].reg_num - data.user[0].reg_new)
				}
				if(this_user_new == 0 && j !== 0){
					//若为后续遍历且无数据
					user_new_list.push(this_user_new)
					user_num_list.push(user_num_list[j - 1])
				}
				if(this_user_new !== 0){
					//若存在数据
					user_new_list.push(this_user_new)
					user_num_list.push(this_user_num)
				}	
			}
		}else{
			var this_user_num = data.reg_num
			var this_user_new = 0
			for(var j = 0; j < date_list.length; j++){
				user_new_list.push(this_user_new)
				user_num_list.push(this_user_num)
			}
		}
		const min1 = _getMinValue(user_new_list),
			  min2 = _getMinValue(user_num_list),
			  max1 = _getMaxValue(user_new_list),
			  max2 = _getMaxValue(user_num_list);
				  
		
		var option = {
			title: {
				text: '用户相关统计',
				textStyle:{
					color:'#1565c0',
					fontStyle:'normal',
					fontWeight:'bold',
				}
			},
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ['用户总数', '新增用户数']
			},
			grid: {
				left: '5%',
				right: '8%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				feature: {
					saveAsImage: {}
				}
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: date_list
			},
			yAxis: [{
				name: '新增数/个',
				type: 'value',
				min: min1,
				max: max1,
				splitNumber: 5,
				interval: (max1 - min1) / 5,
			},
			{
				name: '总数/个',
				type: 'value',
				min: min2,
				max: max2,
				splitNumber: 5,
				interval: (max2 - min2) / 5,
			}],
			series: [
				{
					name: "用户总数",
					data: user_num_list,
					type: 'line',
					smooth: true,
					areaStyle: {},
					showSymbol: false,
					yAxisIndex: 1,
				},
				{
					name: "新增用户数",
					data: user_new_list,
					type: 'line',
					smooth: true,
					showSymbol: false
				}
			]
		}

        // 使用刚指定的配置项和数据显示图表。
        userChart.setOption(option);
	})
}

function getVisitChart(key){
	var now = new Date();
	var nowTime = now.getTime();
	var oneDayTime = 24 * 60 * 60 * 1000;
	var oneMinTime = 60 * 1000;
	
	var visitChart = echarts.init(document.getElementById("visit-chart"), 'walden');
	$.get("/statistic/visit/" + key, function (data, err) {
		if (data.code !== 0) {
			if(user_error == 0){
				user_error = 1
				if (data.code == -502) {
					alert('请先登录')
					return showQuickLogin()
				}
				if (data.code == -510) {
					alert('您不是超级管理员')
					return window.location.href = "/";
				}
				return console.log(data)
			}
		}
		if(key !== "day"){
			if(key == "week"){
				var date_num = 7
			}else if(key == "twoweeks"){
				var date_num = 14
			}else if(key == "month"){
				var date_num = 30
			}else if(key == "year"){
				var date_num = 365
			}
			var date_list = []
			var visit_num_list = []
			var visit_new_list = []
			for(var i = 0; i < date_num; i++){
				var time = nowTime - i * oneDayTime;
				var date = new Date(time).Format("yyyy-MM-dd");
				date_list.push(date)
			}
			date_list.reverse() //数组倒序（日期从小到大）
			if(data.visit){
				for(var j = 0; j < date_list.length; j++){
					var this_visit_num = 0
					var this_visit_new = 0
					for(var i = 0; i < data.visit.length; i++){
						var this_date = data.visit[i].visit_date
						var this_visit_num_data = data.visit[i].visit_num
						var this_visit_new_data = data.visit[i].visit_new
						if(date_list[j] == this_date){
							this_visit_new = this_visit_new_data
							this_visit_num = this_visit_num_data
						}
					}
					if(this_visit_new == 0 && j == 0){
						//若为首个遍历且无数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(data.visit[0].visit_num - data.visit[0].visit_new)
					}
					if(this_visit_new == 0 && j !== 0){
						//若为后续遍历且无数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(visit_num_list[j - 1])
					}
					if(this_visit_new !== 0){
						//若存在数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(this_visit_num)
					}	
				}
			}else{
				var this_visit_num = data.visit_num
				var this_visit_new = 0
				for(var j = 0; j < date_list.length; j++){
					visit_new_list.push(this_visit_new)
					visit_num_list.push(this_visit_num)
				}
			}
			const min1 = _getMinValue(visit_new_list),
				  min2 = _getMinValue(visit_num_list),
				  max1 = _getMaxValue(visit_new_list),
				  max2 = _getMaxValue(visit_num_list);
					  
			
			var option = {
				title: {
					text: '访问量相关统计',
					textStyle:{
						color:'#1565c0',
						fontStyle:'normal',
						fontWeight:'bold',
					}
				},
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: ['访问总量', '新增访问量']
				},
				grid: {
					left: '5%',
					right: '8%',
					bottom: '3%',
					containLabel: true
				},
				toolbox: {
					feature: {
						saveAsImage: {}
					}
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					data: date_list
				},
				yAxis: [{
					name: '新增数/次',
					type: 'value',
					min: min1,
					max: max1,
					splitNumber: 5,
					interval: (max1 - min1) / 5,
				},
				{
					name: '总数/次',
					type: 'value',
					min: min2,
					max: max2,
					splitNumber: 5,
					interval: (max2 - min2) / 5,
				}],
				series: [
					{
						name: "访问总量",
						data: visit_num_list,
						type: 'line',
						smooth: true,
						areaStyle: {},
						showSymbol: false,
						yAxisIndex: 1,
					},
					{
						name: "新增访问量",
						data: visit_new_list,
						type: 'line',
						smooth: true,
						showSymbol: false
					}
				]
			}
		}else{
			var min_num = 60*24 //分钟数
			var time_list = []
			var time_val_list = []
			var visit_num_list = []
			var visit_new_list = []
			for(var i = 0; i < min_num; i++){
				var time = nowTime - i * oneMinTime;
				var time_real = new Date(time).Format("HH:mm");
				var time_val = new Date(time).Format("yyyy-MM-dd HH:mm");
				time_list.push(time_real)
				time_val_list.push(time_val)
			}
			time_list.reverse() //数组倒序（日期从小到大）
			time_val_list.reverse()
			if(data.visit[0].visit_time_val){
				for(var j = 0; j < time_list.length; j++){
					var this_visit_num = 0
					var this_visit_new = 0
					for(var i = 0; i < data.visit.length; i++){
						var this_time = data.visit[i].visit_time_val
						var this_visit_num_data = data.visit[i].visit_num
						var this_visit_new_data = data.visit[i].visit_new
						if(time_list[j] == this_time){
							this_visit_new = this_visit_new_data
							this_visit_num = this_visit_num_data
						}
					}
					if(this_visit_new == 0 && j == 0){
						//若为首个遍历且无数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(data.visit[0].visit_num - data.visit[0].visit_new)
					}
					if(this_visit_new == 0 && j !== 0){
						//若为后续遍历且无数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(visit_num_list[j - 1])
					}
					if(this_visit_new !== 0){
						//若存在数据
						visit_new_list.push(this_visit_new)
						visit_num_list.push(this_visit_num)
					}	
				}
			}else{
				var this_visit_num = data.visit_num
				var this_visit_new = 0
				for(var j = 0; j < time_list.length; j++){
					visit_new_list.push(this_visit_new)
					visit_num_list.push(this_visit_num)
				}
			}
			const min1 = _getMinValue(visit_new_list),
				  min2 = _getMinValue(visit_num_list),
				  max1 = _getMaxValue(visit_new_list),
				  max2 = _getMaxValue(visit_num_list);
					  
			
			var option = {
				title: {
					text: '访问量相关统计',
					textStyle:{
						color:'#1565c0',
						fontStyle:'normal',
						fontWeight:'bold',
					}
				},
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: ['访问总量', '新增访问量']
				},
				grid: {
					left: '5%',
					right: '8%',
					bottom: '3%',
					containLabel: true
				},
				toolbox: {
					feature: {
						saveAsImage: {}
					}
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					data: time_val_list
				},
				yAxis: [{
					name: '新增数/次',
					type: 'value',
					min: min1,
					max: max1,
					splitNumber: 5,
					interval: (max1 - min1) / 5,
				},
				{
					name: '总数/次',
					type: 'value',
					min: min2,
					max: max2,
					splitNumber: 5,
					interval: (max2 - min2) / 5,
				}],
				series: [
					{
						name: "访问总量",
						data: visit_num_list,
						type: 'line',
						smooth: true,
						areaStyle: {},
						showSymbol: false,
						yAxisIndex: 1,
					},
					{
						name: "新增访问量",
						data: visit_new_list,
						type: 'line',
						smooth: true,
						showSymbol: false
					}
				]
			}
		}
        // 使用刚指定的配置项和数据显示图表。
        visitChart.setOption(option);
	})
}