String.prototype.replaceAll = function (s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
}

var order_method = "reverse"

function GetMusic() {
	$.get("/music/history", function (data, err) {
		if (data.code !== 0) {
			return console.log(data)
		}
		var musiclist = ""
		//按时间排序
		var rows = data.data;
		//order_method = "positive"（正序）
		//"reverse"（倒序）
		if (order_method === "positive") {
			rows.sort(function (a, b) {
				return Date.parse(a.date) - Date.parse(b.date);//时间正序
			});
		} else if (order_method === "reverse") {
			rows.sort(function (a, b) {
				return Date.parse(b.date) - Date.parse(a.date);//时间倒序
			});
		}

		data = rows;

		//获取全部年份
		var years = []
		for (var a = 0; a < data.length; a++) {
			var date = data[a].date.split('-')
			if ($.inArray(date[0], years) == -1) {
				years.push(date[0])
			}
		}
		//按年份获取全部歌曲信息
		for (var j = 0; j < years.length; j++) {
			var year = ""
			year = years[j];
			musiclist += "<div class='list-year-wrap' id='" + year + "'><div class='list-year-text'><b>&nbsp;> " + year + "年</b></div>"
			for (var i = 0; i < data.length; i++) {
				var date = data[i].date.split('-')
				if (date[0] == year) {
					musiclist += "<div class='list-item list-item-" + data[i].mid +
						"' id='" + data[i].mid + 
						"'><div class='music-infos' style='display: none;'><ul class='infos'><li class='data'>" + JSON.stringify(data[i]) +
						"</li><li class='obj mid'>" + data[i].mid +
						"</li><li class='obj key-obj date-obj date'>" + data[i].date +
						"</li><li class='obj ncmid'>" + data[i].ncmid +
						"</li><li class='obj state'>" + data[i].state +
						"</li><li class='obj key-obj showname'>" + data[i].showname +
						"</li><li class='obj key-obj realname'>" + data[i].realname +
						"</li><li class='obj key-obj artist'>" + data[i].artist +
						"</li><li class='obj con-uid'>" + data[i].con_uid +
						"</li><li class='obj con-user'>" + data[i].con_user +
						"</li></ul></div><div class='music-date'><div class='music-month'>" + date[1] +
						"</div><div class='music-line'></div><div class='music-day'>" + date[2] +
						"</div></div><div class='music-showname'>" + data[i].showname +
						"</div><div class='music-realname'>" + data[i].realname +
						"</div><div class='music-artist'>" + data[i].artist +
						"</div>"
					if (data[i].con_user !== "") {
						musiclist += "<div class='music-user'>投稿人：<span class='music-user-span'>" + data[i].con_user + "</span></div>"
					}
					musiclist += "</div>"
				}
			}
			musiclist += "</div>"
		}
		if (musiclist == "") {
			musiclist = "<div class='get-music-error'>无法获取下课铃列表！</div>"
		}
		musiclist += "<div class='list-tips-wrap' id='error' style='display:none;'><div class='list-tips-text'><b>&nbsp;> 无搜索结果</b></div>"
		musiclist = musiclist.replace(new RegExp("&nbsp;",("gm"))," ");
		$(".list-content").html(musiclist);
		$('.clear-span.search-month-clear').trigger("click");
		$('.clear-span.search-keyword-clear').trigger("click");
		
		var hash = window.location.hash.split("/")[1]
		if(hash){
			var mid = hash.split("&")[0].split("=")[1]
			var com_id = hash.split("&")[1].split("=")[1]
			$('.list-content').animate({
                    scrollTop: $("#" + mid + "").offset().top - $('.list-content').offset().top + $('.list-content').scrollTop()
			},500,function(){
				$(".list-content .list-item#" + mid + "").trigger("click");
			});
		}
	})
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
		GetMusic()
	} else if ($(this).find('i').hasClass('fa-sort-numeric-asc')) {
		$(this).find('i').removeClass('fa-sort-numeric-asc')
		$(this).find('i').addClass('fa-sort-numeric-desc')
		$(this).find('.order-text-wrap').html('由新到旧')
		order_method = 'reverse'
		GetMusic()
	}
})
