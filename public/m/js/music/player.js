$('.aplayer-wrap').on('click', '.aplayer-info', function () {
	showPlayerPage()
})
$('.aplayer-wrap').on('click', '.player-wrap .btn-back', function () {
	hidePlayerPage()
})
$('.aplayer-wrap').on('click', '.aplayer-bar-wrap', function (e) {
	e.stopPropagation();
})

$(document).on('click', '.aplayer-wrap.show', function () {
	$('.aplayer-wrap .aplayer .aplayer-list').addClass('aplayer-list-hide')
})
$(document).on('click', '.aplayer-wrap.show .aplayer-icon.aplayer-icon-menu', function (e) {
	e.stopPropagation();
})
$(function(){
	$('.aplayer-wrap .aplayer .aplayer-list').addClass('aplayer-list-hide')
})

ap.on('pause', function () {
	$('.aplayer-wrap .aplayer').removeClass('playing')
});
ap.on('play', function () {
	$('.aplayer-wrap .aplayer').addClass('playing')
});
function showPlayerPage(){
	if ($('.search-wrap').hasClass('showed')) {
        $('.search-wrap').removeClass('showed')
        $('.search-wrap .search-box').fadeOut()
        $('.search-wrap').animate({ height: "-=80px" }, 300)
        $('.search-wrap .text').html('展开搜索框')
    }
	if($('.music-infos-wrap .infos-wrap .musicinfos-text .musicinfos#infos').html() !== ""){
		$('.aplayer-wrap').addClass('show')
		$('.aplayer-wrap .player-wrap').fadeIn(200)
		$('.international-header').fadeOut(200)
	}

}
function hidePlayerPage(){
	$('.aplayer-wrap').removeClass('show')
	$('.international-header').fadeIn(200)
	$('.aplayer-wrap .player-wrap').fadeOut(200)
}