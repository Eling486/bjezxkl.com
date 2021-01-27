$('.list-content').on('click', '.list-item', function () {
	//console.log("clicked")
	var detailurl = ""
	var picurl
	var infos = JSON.parse($(this).children('.music-infos').children('.infos').children('.data').html());
	var state = infos.state
	var mid = infos.mid
	var id = infos.ncmid
	var realname = infos.realname
	var artist = infos.artist
	detailurl = "https://www.bjezxkl.com:5100/song/detail?ids=" + id
	if (state !== "local") {
		$.getJSON({
			url: detailurl,
			timeout: 2000,
			error: function (data) {
				alert("获取歌曲封面出错！请重试.");
			},
			success: function (data) {
				//console.log(data);
				picurl = data.songs["0"].al["picUrl"];
				var list = ap.list
				//console.log(list)
				//console.log(ap.audio)
				//console.log(ap.controller)
				var have = false
				var musicnum = 0
				if (!list.audios['0']) {
					musicnum = 1
					if (state == "ok") {
						//console.log(list)
						ap.list.add([{
							name: realname,
							artist: artist,
							url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
							cover: picurl,
							customAudioType: {
								mid: infos.mid
							}
							/*theme: '#ebd0c2'*/
						}]);
						$('.aplayer .aplayer-body .aplayer-info .aplayer-music').append("<span class='aplayer-tips'> - 点击查看详情</span>")
						ap.list.switch(musicnum)
						aplayerSwitched(mid, state)
						ap.play()
					} else {
						ap.list.add([{
							name: realname,
							artist: artist,
							url: "/mp3/" + id + ".mp3",
							cover: picurl,
							customAudioType: {
								mid: infos.mid
							}
							/*theme: '#ebd0c2'*/
						}]);
						ap.list.switch(musicnum)
						aplayerSwitched(mid, state)
						ap.play()
					}
				} else {
					for (var i = 0; i < list.audios.length; i++) {
						if (list.audios[i].customAudioType.date == infos.date) {
							have = true
							musicnum = i
							break;
						} else {
							have = false
							musicnum = i + 1
						}
					}
					if (have == false) {
						if (state == "ok") {
							ap.list.add([{
								name: realname,
								artist: artist,
								url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
								cover: picurl,
								customAudioType: {
									mid: infos.mid
								}
								/*theme: '#ebd0c2'*/
							}]);
							//console.log(picurl)
							//console.log(list)
							ap.list.switch(musicnum)
							aplayerSwitched(mid, state)
							ap.play()


						} else {

							ap.list.add([{
								name: realname,
								artist: artist,
								url: "/mp3/" + id + ".mp3",
								cover: picurl,
								customAudioType: {
									mid: infos.mid
								}
								/*theme: '#ebd0c2'*/
							}]);
							ap.list.switch(musicnum)
							aplayerSwitched(mid, state)
							ap.play()
						}
					} else {
						ap.list.switch(musicnum)
						aplayerSwitched(mid, state)
						ap.play()
					}
				}
			}
		});
	} else {
		var list = ap.list
		var have = false
		var musicnum = 0
		if (!list.audios['0']) {
			musicnum = 1
			if (state == "ok") {
				//console.log(list)
				ap.list.add([{
					name: realname,
					artist: artist,
					url: "https://music.163.com/song/media/outer/url?id=" + id + ".mp3",
					cover: picurl,
					customAudioType: {
						mid: infos.mid
					}
					/*theme: '#ebd0c2'*/
				}]);
				ap.list.switch(musicnum)
				aplayerSwitched(mid, state)
				ap.play()
			} else {
				ap.list.add([{
					name: realname,
					artist: artist,
					url: "/mp3/" + id + ".mp3",
					cover: picurl,
					customAudioType: {
						mid: infos.mid
					}
					/*theme: '#ebd0c2'*/
				}]);
				ap.list.switch(musicnum)
				aplayerSwitched(mid, state)
				ap.play()
			}
		} else {
			for (var i = 0; i < list.audios.length; i++) {
				if (list.audios[i].customAudioType.mid == infos.mid) {
					have = true
					musicnum = i
					break;
				} else {
					have = false
					musicnum = i + 1
				}
			}
			if (have == false) {
				ap.list.add([{
					name: realname,
					artist: artist,
					url: "/mp3/" + id + ".mp3",
					cover: picurl,
					customAudioType: {
						mid: infos.mid
					}
					/*theme: '#ebd0c2'*/
				}]);
				ap.list.switch(musicnum)
				aplayerSwitched(mid, state)
				ap.play()
			} else {
				ap.list.switch(musicnum)
				aplayerSwitched(mid, state)
				ap.play()
			}
		}
	}
});

function aplayerSwitched(mid, state) {
	//$('.infos-wrap').removeClass('hided')
	//$('.infos-wrap').addClass('showed')
	$('.musiclist-wrap').addClass('showed')
	//$('.music-wrap').show()
	if(state == "local"){
		$('.musicinfos-text .musicinfos-label#ncmid').parent().fadeOut(100)
		$('.open-in-ncm').fadeOut(100)
	}else{
		$('.musicinfos-text .musicinfos-label#ncmid').parent().show()
		$('.open-in-ncm').fadeIn(100)
	}
	getCommentsByMid(mid)
}

$(function () {
	ap.audio.addEventListener("loadedmetadata", function () {
		var list_num = ap.list.index
		var play_mid = ap.list.audios[list_num].customAudioType.mid
		var play_infos = JSON.parse($('.list .list-item-' + play_mid + ' .music-infos .infos .data').html())
		//var play_infos = JSON.parse(infos_wrap.parent('.infos').children('.data').html());
		getCommentsByMid(play_infos.mid)
		if (!play_infos.con_user) {
			$('.musicinfos-text span.musicinfos-label#user').parent().hide()
		} else {
			$('.musicinfos-text span.musicinfos-label#user').parent().show()
		}
		if(play_infos.state == "local"){
			$('.musicinfos-text .musicinfos-label#ncmid').parent().fadeOut(100)
			$('.open-in-ncm').fadeOut(100)
		}else{
			$('.musicinfos-text .musicinfos-label#ncmid').parent().show()
			$('.open-in-ncm').fadeIn(100)
		}
		var play_week = ""
		play_week = "20" + play_infos.week.substring(0, 2) + "年" + play_infos.week.substring(2, 4) + "月-第" + play_infos.week.split('-')[1] + "周"
		$('.infos-line').slideDown()
		$('.musicinfos-wrap').slideDown()
		$('.music-operate-wrap').slideDown()
		$('.musicinfos-text span.musicinfos#infos').html(JSON.stringify(play_infos))
		$('.musicinfos-text span.musicinfos#week').html(play_week)
		$('.musicinfos-text span.musicinfos#date').html(play_infos.date)
		$('.musicinfos-text span.musicinfos#ncmid').html(play_infos.ncmid)
		$('.musicinfos-text span.musicinfos#realname').html(play_infos.realname)
		$('.musicinfos-text span.musicinfos#showname').html(play_infos.showname)
		$('.musicinfos-text span.musicinfos#artist').html(play_infos.artist)
		$('.musicinfos-text span.musicinfos#user').html(play_infos.con_user)
	})
})

$(document).on('click', '.hide-infos-wrap', function () {
	if ($('.infos-wrap').hasClass('showed')) {
		$('.hide-infos-wrap i').removeClass('fa-chevron-down')
		$('.infos-wrap').removeClass('showed')
		$('.musiclist-wrap').removeClass('showed')
		$('.infos-wrap-mask').removeClass('showed')
		$('.infos-wrap').addClass('hided')
		$('.hide-infos-wrap i').addClass('fa-chevron-up')
	} else {
		$('.hide-infos-wrap i').removeClass('fa-chevron-up')
		$('.infos-wrap').addClass('showed')
		$('.musiclist-wrap').addClass('showed')
		$('.infos-wrap-mask').addClass('showed')
		$('.infos-wrap').removeClass('hided')
		$('.hide-infos-wrap i').addClass('fa-chevron-down')
	}
});
$(document).on('click', '.infos-wrap-mask.showed', function () {
	console.log('clicked')
	$('.hide-infos-wrap i').removeClass('fa-chevron-down')
	$('.infos-wrap').removeClass('showed')
	$('.musiclist-wrap').removeClass('showed')
	$('.infos-wrap-mask').removeClass('showed')
	$('.infos-wrap').addClass('hided')
	$('.hide-infos-wrap i').addClass('fa-chevron-up')
})