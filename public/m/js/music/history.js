$(document).on('click', '.show-search-btn', function () {
    if ($('.search-wrap').hasClass('showed')) {
        $('.search-wrap').removeClass('showed')
        $('.search-wrap .search-box').fadeOut()
        $('.search-wrap').animate({ height: "-=80px" }, 300)
        $('.search-wrap .text').html('展开搜索框')
    } else {
        $('.search-wrap').addClass('showed')
        $('.search-wrap .text').html('收起搜索框')
        $('.search-wrap').animate({ height: "+=80px" }, 300)
        $('.search-wrap .search-box').fadeIn()
    }
})

$(document).on('click', '.tool-item.show-infos-page', function () {
        $('.music-infos-wrap').addClass('showed')
        $('.music-infos-wrap').fadeIn(200)
})
$(document).on('click', '.music-infos-wrap.showed .local-header .btn-back.back', function () {
	$('.music-infos-wrap').removeClass('showed')
	$('.music-infos-wrap').fadeOut(100)
})

$(document).on('click', '.tool-item.show-comment-page', function () {
        $('.comment-wrap').addClass('showed')
        $('.comment-wrap').fadeIn(200)
})
$(document).on('click', '.comment-wrap.showed .local-header .btn-back.back', function () {
	$('.comment-wrap').removeClass('showed')
	$('.comment-wrap').fadeOut(100)
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
        month = PrefixInteger($(this).attr('id'),2) + "-"
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

$(document).on('click', '.open-in-ncm', function () {
    var url = "http://music.163.com/song?id=" + $('.musicinfos#ncmid').html()
    window.open(url, '_blank');
})